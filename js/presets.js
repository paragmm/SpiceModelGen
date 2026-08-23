/**
 * ═══════════════════════════════════════════════════════
 *  presets.js — Built-in transistor presets
 *  Each preset contains datasheet values, SPICE params,
 *  and optional custom parameters.
 * ═══════════════════════════════════════════════════════
 */

var SpicePresets = (function () {
    'use strict';

    var PRESETS = {
        bc847b: {
            name: 'BC847B',
            type: 'NPN',
            ds: {
                vceo: '45', ic: '100', hfe_min: '200', hfe_max: '450',
                ft: '200', vbe: '650', vcesat: '250', cob: '3.0',
                cib: '8.0', icbo: '15', package: 'SOT-23', marking: 'G1F'
            },
            sp: {
                bf: '281.7', is: '1.124e-14', vaf: '36.27', ikf: '0.09455',
                nf: '0.9872', nr: '0.9859', br: '7.047', tf: '6.258e-10',
                tr: '1.55e-7', cjc: '3.624e-12', cje: '1.264e-11',
                vje: '0.7056', mje: '0.3401', eg: '1.11', xti: '7.452',
                xtb: '1.382', rb: '150', re: '0.804', rc: '0.2454',
                irb: '0.0008356', rbm: '0.8289', xtf: '25', vtf: '2',
                itf: '0.277', vjc: '0.5036', mjc: '0.365'
            },
            custom: [
                { name: 'XCJC', value: '1' },
                { name: 'CJS', value: '0' },
                { name: 'VJS', value: '0.75' },
                { name: 'MJS', value: '0.333' },
                { name: 'FC', value: '0.78' }
            ]
        },

        bc857b: {
            name: 'BC857B',
            type: 'PNP',
            ds: {
                vceo: '45', ic: '100', hfe_min: '200', hfe_max: '450',
                ft: '200', vbe: '650', vcesat: '250', cob: '3.0',
                cib: '8.0', icbo: '15', package: 'SOT-23', marking: 'G1F'
            },
            sp: {
                bf: '280', is: '1.0e-14', vaf: '35', ikf: '0.09',
                nf: '0.99', nr: '0.99', br: '6.5', tf: '6.5e-10',
                tr: '1.6e-7', cjc: '3.5e-12', cje: '1.2e-11',
                vje: '0.70', mje: '0.34', eg: '1.11', xti: '7.4',
                xtb: '1.38', rb: '150', re: '0.8', rc: '0.25',
                irb: '0.0008', rbm: '0.83', xtf: '25', vtf: '2',
                itf: '0.28', vjc: '0.50', mjc: '0.37'
            },
            custom: [
                { name: 'XCJC', value: '1' },
                { name: 'CJS', value: '0' }
            ]
        },

        '2n3904': {
            name: '2N3904',
            type: 'NPN',
            ds: {
                vceo: '40', ic: '200', hfe_min: '100', hfe_max: '300',
                ft: '300', vbe: '650', vcesat: '200', cob: '4.5',
                cib: '8.0', icbo: '50', package: 'TO-92', marking: '3904'
            },
            sp: {
                bf: '200', is: '6.7e-15', vaf: '40', ikf: '0.12',
                nf: '0.98', nr: '0.98', br: '4.5', tf: '4.0e-10',
                tr: '1.8e-7', cjc: '4.0e-12', cje: '1.1e-11',
                vje: '0.68', mje: '0.35', eg: '1.11', xti: '7.0',
                xtb: '1.4', rb: '120', re: '0.7', rc: '0.2',
                irb: '0.001', rbm: '0.7', xtf: '20', vtf: '1.5',
                itf: '0.3', vjc: '0.48', mjc: '0.36'
            },
            custom: [
                { name: 'XCJC', value: '1' }
            ]
        },

        '2n3906': {
            name: '2N3906',
            type: 'PNP',
            ds: {
                vceo: '40', ic: '200', hfe_min: '100', hfe_max: '300',
                ft: '250', vbe: '650', vcesat: '250', cob: '4.5',
                cib: '8.0', icbo: '50', package: 'TO-92', marking: '3906'
            },
            sp: {
                bf: '180', is: '5.0e-15', vaf: '35', ikf: '0.10',
                nf: '0.99', nr: '0.99', br: '4.0', tf: '4.5e-10',
                tr: '1.7e-7', cjc: '4.2e-12', cje: '1.0e-11',
                vje: '0.68', mje: '0.36', eg: '1.11', xti: '7.0',
                xtb: '1.4', rb: '130', re: '0.8', rc: '0.25',
                irb: '0.001', rbm: '0.75', xtf: '22', vtf: '1.8',
                itf: '0.25', vjc: '0.48', mjc: '0.36'
            },
            custom: [
                { name: 'XCJC', value: '1' }
            ]
        },

        'bc547b': {
            name: 'BC547B',
            type: 'NPN',
            ds: {
                vceo: '45', ic: '100', hfe_min: '200', hfe_max: '450',
                ft: '300', vbe: '660', vcesat: '250', cob: '3.5',
                cib: '9.0', icbo: '15', package: 'TO-92', marking: 'BC547B'
            },
            sp: {
                bf: '300', is: '1.8e-14', vaf: '50', ikf: '0.10',
                nf: '0.98', nr: '0.98', br: '6', tf: '5.3e-10',
                tr: '1.5e-7', cjc: '3.5e-12', cje: '1.1e-11',
                vje: '0.70', mje: '0.33', eg: '1.11', xti: '3',
                xtb: '1.5', rb: '100', re: '0.6', rc: '0.3',
                irb: '0.001', rbm: '0.8', xtf: '20', vtf: '2',
                itf: '0.29', vjc: '0.50', mjc: '0.35'
            },
            custom: [
                { name: 'XCJC', value: '1' },
                { name: 'FC', value: '0.5' }
            ]
        },

        'tip41c': {
            name: 'TIP41C',
            type: 'NPN',
            ds: {
                vceo: '100', ic: '6000', hfe_min: '15', hfe_max: '75',
                ft: '3', vbe: '1200', vcesat: '1500', cob: '100',
                cib: '200', icbo: '700', package: 'TO-220', marking: 'TIP41C'
            },
            sp: {
                bf: '33', is: '1.0e-12', vaf: '100', ikf: '3.0',
                nf: '1.0', nr: '1.0', br: '3', tf: '5.3e-8',
                tr: '5.0e-6', cjc: '1.0e-10', cje: '2.0e-10',
                vje: '0.75', mje: '0.33', eg: '1.11', xti: '3',
                xtb: '1.5', rb: '5', re: '0.1', rc: '0.05',
                irb: '0.01', rbm: '0.5', xtf: '10', vtf: '3',
                itf: '3.0', vjc: '0.50', mjc: '0.33'
            },
            custom: [
                { name: 'XCJC', value: '0.5' },
                { name: 'FC', value: '0.5' }
            ]
        }
    };

    /**
     * Get a preset by key
     */
    function get(key) {
        return PRESETS[key] || null;
    }

    /**
     * Get all preset keys
     */
    function keys() {
        return Object.keys(PRESETS);
    }

    /**
     * Get all presets as {key, name, type} for dropdown
     */
    function list() {
        return Object.keys(PRESETS).map(function (k) {
            return { key: k, name: PRESETS[k].name, type: PRESETS[k].type };
        });
    }

    return {
        get: get,
        keys: keys,
        list: list,
        PRESETS: PRESETS
    };
})();
