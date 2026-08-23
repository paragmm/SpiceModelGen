/**
 * ═══════════════════════════════════════════════════════
 *  engine.js — SPICE Model Generation Engine
 *  Core business logic: auto-calc Gummel-Poon, generate
 *  SPICE model text, format output.
 * ═══════════════════════════════════════════════════════
 */

var SpiceEngine = (function () {
    'use strict';

    // ─── SPICE field key order ───
    var SPICE_KEYS = [
        'bf', 'is', 'vaf', 'ikf', 'nf', 'nr', 'br', 'tf', 'tr',
        'cjc', 'cje', 'vje', 'mje', 'eg', 'xti', 'xtb',
        'rb', 're', 'rc', 'irb', 'rbm', 'xtf', 'vtf', 'itf',
        'vjc', 'mjc'
    ];

    // ─── SPICE parameter display name mapping ───
    var SPICE_LABELS = {
        bf: 'BF', is: 'IS', vaf: 'VAF', ikf: 'IKF', nf: 'NF', nr: 'NR',
        br: 'BR', tf: 'TF', tr: 'TR', cjc: 'CJC', cje: 'CJE', vje: 'VJE',
        mje: 'MJE', eg: 'EG', xti: 'XTI', xtb: 'XTB', rb: 'RB', re: 'RE',
        rc: 'RC', irb: 'IRB', rbm: 'RBM', xtf: 'XTF', vtf: 'VTF',
        itf: 'ITF', vjc: 'VJC', mjc: 'MJC'
    };

    /**
     * Auto-calculate Gummel-Poon parameters from datasheet values.
     * @param {Object} ds - datasheet values
     * @returns {Object} { spice: {}, custom: [] }
     */
    function autoCalcGummelPoon(ds) {
        var hfeMin  = parseFloat(ds.hfe_min) || 200;
        var hfeMax  = parseFloat(ds.hfe_max) || 450;
        var ftMHz   = parseFloat(ds.ft) || 200;
        var vbeMV   = parseFloat(ds.vbe) || 650;
        var icMA    = parseFloat(ds.ic) || 100;
        var cobPF   = parseFloat(ds.cob) || 3.0;
        var cibPF   = parseFloat(ds.cib) || 8.0;

        // BF: geometric mean of hFE range
        var BF = Math.round(Math.sqrt(hfeMin * hfeMax) * 10) / 10;

        // IS: saturation current using VBE at IC=2mA (typical measurement condition)
        var VT = 0.02585; // thermal voltage at 25°C
        var NF = 0.987;
        var IC_REF = 0.002; // 2mA
        var VBE_REF = vbeMV / 1000;
        var IS = IC_REF / Math.exp(VBE_REF / (NF * VT));

        // VAF: Early voltage
        var VAF = 36;

        // IKF: high-current roll-off, approx 1.5 * IC_max (A)
        var IKF = (icMA * 1.5) / 1000;

        // TF: forward transit time from fT
        var fT_Hz = ftMHz * 1e6;
        var TF = 1 / (2 * Math.PI * fT_Hz);

        // TR: reverse transit time ≈ 150 * TF
        var TR = TF * 150;

        // CJC ≈ Cob (pF to F)
        var CJC = cobPF * 1e-12;

        // CJE ≈ (Cib - Cob) if positive, else Cib
        var CJE = (cibPF > cobPF) ? (cibPF - cobPF) * 1e-12 : cibPF * 1e-12;

        // Other parameters (fixed typical values)
        var NR  = 0.9859;
        var BR  = 7.047;
        var VJE = 0.7056;
        var MJE = 0.3401;
        var EG  = 1.11;
        var XTI = 7.452;
        var XTB = 1.382;
        var RB  = 150;
        var RE  = 0.804;
        var RC  = 0.2454;
        var IRB = 0.0008356;
        var RBM = 0.8289;
        var XTF = 25;
        var VTF = 2;
        var ITF = 0.277;
        var VJC = 0.5036;
        var MJC = 0.365;

        var spice = {
            bf:  '' + BF,
            is:  IS.toExponential(4),
            vaf: '' + VAF,
            ikf: IKF.toFixed(6),
            nf:  '' + NF,
            nr:  '' + NR,
            br:  '' + BR,
            tf:  TF.toExponential(4),
            tr:  TR.toExponential(4),
            cjc: CJC.toExponential(4),
            cje: CJE.toExponential(4),
            vje: '' + VJE,
            mje: '' + MJE,
            eg:  '' + EG,
            xti: '' + XTI,
            xtb: '' + XTB,
            rb:  '' + RB,
            re:  '' + RE,
            rc:  '' + RC,
            irb: '' + IRB,
            rbm: '' + RBM,
            xtf: '' + XTF,
            vtf: '' + VTF,
            itf: '' + ITF,
            vjc: '' + VJC,
            mjc: '' + MJC
        };

        var custom = [
            { name: 'XCJC', value: '1' },
            { name: 'CJS',  value: '0' },
            { name: 'VJS',  value: '0.75' },
            { name: 'MJS',  value: '0.333' },
            { name: 'FC',   value: '0.78' }
        ];

        return { spice: spice, custom: custom };
    }

    /**
     * Generate SPICE model text from parameters.
     * @param {Object} opts
     * @param {string} opts.name - model name
     * @param {string} opts.type - NPN or PNP
     * @param {Object} opts.spice - SPICE parameter key/value pairs
     * @param {Array}  opts.custom - [{name, value}]
     * @param {Object} opts.datasheet - datasheet summary for comments
     * @returns {Object} { text, paramCount }
     */
    function generateModel(opts) {
        var name     = opts.name || 'MY_NPN';
        var type     = opts.type || 'NPN';
        var spice    = opts.spice || {};
        var custom   = opts.custom || [];
        var ds       = opts.datasheet || {};

        var params = {};

        // Collect SPICE core params in order
        SPICE_KEYS.forEach(function (key) {
            var val = (spice[key] || '').toString().trim();
            if (val !== '') {
                params[SPICE_LABELS[key]] = val;
            }
        });

        // Collect custom params
        custom.forEach(function (p) {
            var n = (p.name || '').trim();
            var v = (p.value || '').trim();
            if (n && v) {
                params[n] = v;
            }
        });

        var paramStrings = [];
        Object.keys(params).forEach(function (k) {
            paramStrings.push(k + '=' + params[k]);
        });

        var count = paramStrings.length;
        var output = '';

        // Header comment
        output += '* ─── SPICE Model: ' + name + ' (' + type + ') ───\n';
        if (opts.manufacturer) {
            output += '* Manufacturer: ' + opts.manufacturer + '\n';
        }
        output += '* Generated by SPICE Model Generator v3.0 (https://github.com/paragmm/SpiceModelGen)\n';
        output += '* Date: ' + new Date().toISOString().split('T')[0] + '\n';

        if (ds.vceo) {
            output += '*   VCEO=' + ds.vceo + 'V  IC=' + ds.ic + 'mA  hFE=' + ds.hfe_min + '-' + ds.hfe_max + '\n';
            output += '*   fT=' + ds.ft + 'MHz  VBE(on)=' + ds.vbe + 'mV  VCE(sat)=' + ds.vcesat + 'mV\n';
            if (ds.package) output += '*   Package: ' + ds.package + '\n';
            if (ds.marking) output += '*   Marking: ' + ds.marking + '\n';
        }
        output += '* ────────────────────────────────────────────────\n';

        if (count === 0) {
            output += '\n* No parameters defined. Fill in the fields and generate again.\n';
        } else {
            output += '\n.model ' + name + ' ' + type + ' (\n';
            var line = '+ ';
            var perLine = 5;
            for (var i = 0; i < paramStrings.length; i++) {
                line += paramStrings[i];
                if (i < paramStrings.length - 1) line += ' ';
                if ((i + 1) % perLine === 0 && i < paramStrings.length - 1) {
                    output += line + '\n';
                    line = '+ ';
                }
            }
            if (line !== '+ ') {
                output += line;
            }
            output += ')\n';
        }

        output += '\n* End of model\n';

        return {
            text: output,
            paramCount: count
        };
    }

    /**
     * Generate .lib file content from multiple models.
     * @param {Array} models - array of model objects from library
     * @returns {string} .lib file content
     */
    function generateLibFile(models) {
        var content = '';
        content += '* ══════════════════════════════════════════════════════\n';
        content += '* SPICE Model Library\n';
        content += '* Generated by SPICE Model Generator v3.0 (https://github.com/paragmm/SpiceModelGen)\n';
        content += '* Date: ' + new Date().toISOString().split('T')[0] + '\n';
        content += '* Models: ' + models.length + '\n';
        content += '* ══════════════════════════════════════════════════════\n\n';

        models.forEach(function (model, idx) {
            var result = generateModel({
                name: model.name,
                type: model.type,
                spice: model.spice,
                custom: model.custom || [],
                datasheet: model.datasheet || {}
            });
            content += result.text;
            if (idx < models.length - 1) {
                content += '\n';
            }
        });

        content += '\n.end\n';
        return content;
    }

    return {
        SPICE_KEYS: SPICE_KEYS,
        SPICE_LABELS: SPICE_LABELS,
        autoCalcGummelPoon: autoCalcGummelPoon,
        generateModel: generateModel,
        generateLibFile: generateLibFile
    };
})();
