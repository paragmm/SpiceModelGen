/**
 * ═══════════════════════════════════════════════════════
 *  app.js — Main Application Controller
 *  Wires up all modules: presets, engine, library, UI.
 * ═══════════════════════════════════════════════════════
 */

$(function () {
    'use strict';

    // ─── State ───────────────────────────────────────────
    var customParams = []; // [{name, value}]

    // ─── DOM References ─────────────────────────────────
    // (Using jQuery)
    var $modelName      = $('#modelName');
    var $modelType      = $('#modelType');
    var $presetSelect   = $('#presetSelect');
    var $librarySelect  = $('#librarySelect');
    var $outputArea     = $('#outputArea');
    var $paramCount     = $('#paramCount');
    var $displayType    = $('#displayType');
    var $displayName    = $('#displayName');
    var $customParamList= $('#customParamList');
    var $libCount       = $('#libCount');
    var $libraryGrid    = $('#libraryGrid');

    // Datasheet field IDs
    var DS_FIELDS = ['vceo', 'ic', 'hfe_min', 'hfe_max', 'ft', 'vbe', 'vcesat', 'cob', 'cib', 'icbo', 'package', 'marking'];
    // SPICE field IDs
    var SP_FIELDS = SpiceEngine.SPICE_KEYS;

    // ═══════════════════════════════════════════════════
    //  INITIALIZATION
    // ═══════════════════════════════════════════════════

    function init() {
        SpiceUI.initParticles();
        SpiceUI.initCollapsibles();
        SpiceUI.initThemeToggle();
        SpiceUI.initTooltips();
        
        SpiceLibrary.syncFromBackend().then(function() {
            populatePresetDropdown();
            refreshLibraryDropdown();
            refreshLibCount();
            bindEvents();

            // Load a random preset
            var presetKeys = SpicePresets.keys();
            var randomKey = presetKeys[Math.floor(Math.random() * presetKeys.length)];
            $presetSelect.val(randomKey);
            loadPreset(randomKey);
        });
    }

    // ═══════════════════════════════════════════════════
    //  PRESET DROPDOWN
    // ═══════════════════════════════════════════════════

    function populatePresetDropdown() {
        var items = SpicePresets.list();
        items.forEach(function (item) {
            $presetSelect.append(
                $('<option></option>')
                    .val(item.key)
                    .text(item.name + ' (' + item.type + ')')
            );
        });
    }

    function loadPreset(key) {
        var p = SpicePresets.get(key);
        if (!p) return;

        $modelName.val(p.name);
        $modelType.val(p.type);

        // Set datasheet fields
        if (p.ds) {
            DS_FIELDS.forEach(function (f) {
                $('#ds_' + f).val(p.ds[f] || '');
            });
        }

        // Set SPICE fields
        if (p.sp) {
            SP_FIELDS.forEach(function (f) {
                $('#sp_' + f).val(p.sp[f] || '');
            });
        }

        // Set custom params
        customParams = (p.custom || []).map(function (c) {
            return { name: c.name, value: c.value };
        });
        renderCustomParams();
        generateModel();
        SpiceUI.showToast('Loaded preset: ' + p.name + ' (' + p.type + ')', 'success');
    }

    // ═══════════════════════════════════════════════════
    //  LIBRARY DROPDOWN
    // ═══════════════════════════════════════════════════

    function refreshLibraryDropdown() {
        $librarySelect.empty().append('<option value="">— Select saved model —</option>');
        var models = SpiceLibrary.getAll();
        models.forEach(function (m) {
            $librarySelect.append(
                $('<option></option>')
                    .val(m.name)
                    .text(m.name + ' (' + m.type + ')')
            );
        });
    }

    function refreshLibCount() {
        var c = SpiceLibrary.count();
        $libCount.text(c);
        $libCount.addClass('updated');
        setTimeout(function () { $libCount.removeClass('updated'); }, 500);
    }

    function loadFromLibrary(name) {
        var model = SpiceLibrary.getByName(name);
        if (!model) return;

        $modelName.val(model.name);
        $modelType.val(model.type);

        // Set datasheet fields
        if (model.datasheet) {
            DS_FIELDS.forEach(function (f) {
                $('#ds_' + f).val(model.datasheet[f] || '');
            });
        }

        // Set SPICE fields
        if (model.spice) {
            SP_FIELDS.forEach(function (f) {
                $('#sp_' + f).val(model.spice[f] || '');
            });
        }

        // Set custom params
        customParams = (model.custom || []).map(function (c) {
            return { name: c.name, value: c.value };
        });
        renderCustomParams();
        generateModel();
        SpiceUI.showToast('Loaded from library: ' + model.name, 'success');
    }

    // ═══════════════════════════════════════════════════
    //  CUSTOM PARAMETERS
    // ═══════════════════════════════════════════════════

    function renderCustomParams() {
        if (customParams.length === 0) {
            $customParamList.html(
                '<div class="empty-state text-center py-3 d-flex align-items-center justify-content-center gap-2">' +
                '<i class="fa-regular fa-circle-dot"></i> No custom parameters added yet.</div>'
            );
            return;
        }

        var html = '';
        customParams.forEach(function (p, idx) {
            html += '<div class="param-row">' +
                '<span class="pname">' + SpiceUI.escHtml(p.name) + '</span>' +
                '<span class="pvalue">' + SpiceUI.escHtml(p.value) + '</span>' +
                '<button class="del-btn" data-idx="' + idx + '" title="Remove">' +
                '<i class="fa-solid fa-xmark"></i></button>' +
                '</div>';
        });
        $customParamList.html(html);
    }

    // ═══════════════════════════════════════════════════
    //  GENERATE MODEL
    // ═══════════════════════════════════════════════════

    function getDatasheetValues() {
        var ds = {};
        DS_FIELDS.forEach(function (f) {
            ds[f] = $('#ds_' + f).val().trim();
        });
        return ds;
    }

    function getSpiceValues() {
        var sp = {};
        SP_FIELDS.forEach(function (f) {
            sp[f] = $('#sp_' + f).val().trim();
        });
        return sp;
    }

    function generateModel() {
        var name = $modelName.val().trim() || 'MY_NPN';
        var type = $modelType.val() || 'NPN';

        $displayName.text(name);
        $displayType.text(type);

        var result = SpiceEngine.generateModel({
            name: name,
            type: type,
            spice: getSpiceValues(),
            custom: customParams,
            datasheet: getDatasheetValues()
        });

        $outputArea.text(result.text);
        $paramCount.text(result.paramCount + ' params');
        $outputArea.addClass('generating');
        setTimeout(function () { $outputArea.removeClass('generating'); }, 500);
    }

    // ═══════════════════════════════════════════════════
    //  AUTO-CALC GUMMEL-POON
    // ═══════════════════════════════════════════════════

    function autoCalcGummelPoon() {
        var ds = getDatasheetValues();
        
        // 1. Validation
        var requiredFields = {
            vceo: 'VCEO (Collector-Emitter Voltage)',
            ic: 'IC (Collector Current)',
            hfe_min: 'hFE min (Min DC Gain)',
            hfe_max: 'hFE max (Max DC Gain)',
            ft: 'fT (Transition Frequency)',
            vbe: 'VBE(on) (Base-Emitter Turn-On)',
            vcesat: 'VCE(sat) (Saturation Voltage)',
            cob: 'Cob (Output Capacitance)'
        };

        var missing = [];
        for (var key in requiredFields) {
            if (!ds[key] || ds[key].trim() === '') {
                missing.push(requiredFields[key]);
            } else if (isNaN(parseFloat(ds[key]))) {
                missing.push(requiredFields[key] + ' (Must be a number)');
            }
        }

        if (missing.length > 0) {
            var $list = $('#validationMissingList');
            $list.empty();
            missing.forEach(function(item) {
                $list.append($('<li>').text(item));
            });
            var validationModal = new bootstrap.Modal(document.getElementById('validationModal'));
            validationModal.show();
            return;
        }

        // 2. Calculation
        var result = SpiceEngine.autoCalcGummelPoon(ds);

        // Populate SPICE fields
        SP_FIELDS.forEach(function (f) {
            if (result.spice[f] !== undefined) {
                $('#sp_' + f).val(result.spice[f]);
            }
        });

        // Set custom params
        customParams = result.custom;
        renderCustomParams();
        generateModel();
        SpiceUI.showToast('Gummel‑Poon parameters auto‑calculated!', 'success');
    }

    // ═══════════════════════════════════════════════════
    //  SAVE TO LIBRARY
    // ═══════════════════════════════════════════════════

    function saveToLibrary() {
        var name = $modelName.val().trim();
        if (!name) {
            SpiceUI.showToast('Please enter a model name first.', 'error');
            return;
        }

        var model = {
            name: name,
            type: $modelType.val(),
            datasheet: getDatasheetValues(),
            spice: getSpiceValues(),
            custom: customParams.slice()
        };

        var isNew = SpiceLibrary.save(model);
        refreshLibraryDropdown();
        refreshLibCount();

        if (isNew) {
            SpiceUI.showToast('Model "' + name + '" saved to library!', 'success');
        } else {
            SpiceUI.showToast('Model "' + name + '" updated in library.', 'success');
        }
    }

    // ═══════════════════════════════════════════════════
    //  LIBRARY MODAL
    // ═══════════════════════════════════════════════════

    function renderLibraryModal(query) {
        var models = SpiceLibrary.search(query);

        if (models.length === 0) {
            $libraryGrid.html(
                '<div class="empty-state-large text-center py-5">' +
                '<i class="fa-regular fa-folder-open d-block mb-3"></i>' +
                '<p>' + (query ? 'No models match your search.' : 'No models saved yet.') + '</p>' +
                '<span>Generate a model and click "Save to Library" to get started.</span>' +
                '</div>'
            );
            return;
        }

        var html = '';
        models.forEach(function (m, idx) {
            var typeClass = (m.type || 'npn').toLowerCase();
            var savedDate = m.savedAt ? new Date(m.savedAt).toLocaleDateString() : 'Unknown';
            var paramC = 0;
            if (m.spice) paramC += Object.keys(m.spice).filter(function(k){ return m.spice[k]; }).length;
            if (m.custom) paramC += m.custom.length;

            html += '<div class="lib-card ' + typeClass + '" data-name="' + SpiceUI.escHtml(m.name) + '" style="animation-delay:' + (idx * 0.05) + 's;">';
            html += '<div class="d-flex align-items-center justify-content-between mb-2">';
            html += '<span class="lib-card-name">' + SpiceUI.escHtml(m.name) + '</span>';
            html += '<span class="lib-card-type ' + typeClass + '">' + SpiceUI.escHtml(m.type) + '</span>';
            html += '</div>';
            html += '<div class="lib-card-meta d-flex flex-column gap-1 mb-3">';
            if (m.datasheet && m.datasheet.package) {
                html += '<span class="d-flex align-items-center gap-2"><i class="fa-solid fa-cube"></i> ' + SpiceUI.escHtml(m.datasheet.package) + '</span>';
            }
            html += '<span class="d-flex align-items-center gap-2"><i class="fa-solid fa-sliders"></i> ' + paramC + ' parameters</span>';
            html += '<span class="d-flex align-items-center gap-2"><i class="fa-regular fa-calendar"></i> ' + savedDate + '</span>';
            html += '</div>';
            html += '<div class="lib-card-actions d-flex gap-2 pt-2">';
            html += '<button class="btn btn-sm btn-primary lib-load-btn" data-name="' + SpiceUI.escHtml(m.name) + '">';
            html += '<i class="fa-solid fa-upload"></i> Load</button>';
            html += '<button class="btn btn-sm btn-accent lib-dl-btn" data-name="' + SpiceUI.escHtml(m.name) + '">';
            html += '<i class="fa-solid fa-file-arrow-down"></i> .lib</button>';
            html += '<button class="btn btn-sm btn-danger lib-del-btn" data-name="' + SpiceUI.escHtml(m.name) + '">';
            html += '<i class="fa-solid fa-trash"></i></button>';
            html += '</div>';
            html += '</div>';
        });

        $libraryGrid.html(html);
    }

    // ═══════════════════════════════════════════════════
    //  DOWNLOAD .LIB (single model)
    // ═══════════════════════════════════════════════════

    function downloadCurrentAsLib() {
        var name = $modelName.val().trim() || 'MY_MODEL';
        var type = $modelType.val() || 'NPN';

        var result = SpiceEngine.generateModel({
            name: name,
            type: type,
            spice: getSpiceValues(),
            custom: customParams,
            datasheet: getDatasheetValues()
        });

        SpiceLibrary.downloadFile(result.text, name + '.lib', 'text/plain');
        SpiceUI.showToast('Downloaded ' + name + '.lib', 'success');
    }

    function clearAllFields(skipConfirm) {
        if (!skipConfirm && !confirm('Clear all fields and start over?')) return;

        $('input[type="text"]').each(function () {
            if (this.id !== 'modelName' && this.id !== 'librarySearch') {
                $(this).val('');
            }
        });
        $modelName.val('MY_NPN');
        $modelType.val('NPN');
        customParams = [];
        renderCustomParams();
        $outputArea.text('/* Fill in the parameters and click Generate */');
        $paramCount.text('0 params');
        $displayName.text('MY_NPN');
        $displayType.text('NPN');
        SpiceUI.showToast('Cleared all fields.', '');
    }

    // ═══════════════════════════════════════════════════
    //  EVENT BINDINGS
    // ═══════════════════════════════════════════════════

    function bindEvents() {

        // ─── Preset Load ───
        $('#loadPresetBtn').on('click', function () {
            var key = $presetSelect.val();
            if (!key) {
                SpiceUI.showToast('Select a preset first.', '');
                return;
            }
            loadPreset(key);
        });
        $presetSelect.on('change', function() {
            var key = $(this).val();
            if (key) {
                loadPreset(key);
            } else {
                clearAllFields(true);
            }
        });

        // ─── Library Load ───
        $('#loadLibraryBtn').on('click', function () {
            var name = $librarySelect.val();
            if (!name) {
                SpiceUI.showToast('Select a saved model first.', '');
                return;
            }
            loadFromLibrary(name);
        });
        $librarySelect.on('change', function() {
            var name = $(this).val();
            if (name) loadFromLibrary(name);
        });

        // ─── Library Delete (from toolbar) ───
        $('#deleteLibraryBtn').on('click', function () {
            var name = $librarySelect.val();
            if (!name) {
                SpiceUI.showToast('Select a model to delete.', '');
                return;
            }
            if (!confirm('Delete "' + name + '" from library?')) return;
            SpiceLibrary.remove(name);
            refreshLibraryDropdown();
            refreshLibCount();
            SpiceUI.showToast('Deleted "' + name + '" from library.', 'success');
        });

        // ─── Auto-calc ───
        $('#autoCalcBtn').on('click', autoCalcGummelPoon);

        // ─── Generate ───
        $('#generateBtn').on('click', generateModel);

        // ─── Save to Library ───
        $('#saveToLibBtn').on('click', saveToLibrary);

        // ─── Copy ───
        $('#copyBtn').on('click', function () {
            var text = $outputArea.text();
            if (!text || text.indexOf('Fill in the parameters') !== -1) {
                SpiceUI.showToast('Nothing to copy – generate a model first.', '');
                return;
            }
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(function () {
                    SpiceUI.showToast('Model copied to clipboard!', 'success');
                }).catch(function () {
                    fallbackCopy();
                });
            } else {
                fallbackCopy();
            }
        });

        function fallbackCopy() {
            var range = document.createRange();
            range.selectNode($outputArea[0]);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            document.execCommand('copy');
            window.getSelection().removeAllRanges();
            SpiceUI.showToast('Model copied!', 'success');
        }

        // ─── Download .lib (current) ───
        $('#downloadLibBtn').on('click', downloadCurrentAsLib);

        // ─── Download All .lib ───
        $('#downloadAllLibBtn').on('click', function () {
            if (!SpiceLibrary.downloadAllAsLib()) {
                SpiceUI.showToast('No models in library to download.', 'error');
            } else {
                SpiceUI.showToast('Downloaded spice_library.lib', 'success');
            }
        });

        // ─── Clear ───
        $('#clearBtn').on('click', function () {
            clearAllFields(false);
        });

        // ─── Add Custom Param ───
        $('#addCustomParamBtn').on('click', function () {
            var name = $('#customParamName').val().trim();
            var value = $('#customParamValue').val().trim();
            if (!name || !value) {
                SpiceUI.showToast('Enter both parameter name and value.', '');
                return;
            }
            var exists = customParams.some(function (p) {
                return p.name.toLowerCase() === name.toLowerCase();
            });
            if (exists) {
                SpiceUI.showToast('Parameter "' + name + '" already exists.', '');
                return;
            }
            customParams.push({ name: name, value: value });
            $('#customParamName').val('');
            $('#customParamValue').val('');
            renderCustomParams();
            generateModel();
            SpiceUI.showToast('Added ' + name + ' = ' + value, 'success');
        });

        // Enter key in custom param fields
        $('#customParamName, #customParamValue').on('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                $('#addCustomParamBtn').click();
            }
        });

        // ─── Delete custom param ───
        $(document).on('click', '.del-btn[data-idx]', function () {
            var idx = parseInt($(this).data('idx'));
            customParams.splice(idx, 1);
            renderCustomParams();
            generateModel();
        });

        // ─── Auto-generate on any input change ───
        $(document).on('input change', '#cardIdentity input, #cardIdentity select, #cardDatasheet input, #cardSpice input', function () {
            generateModel();
        });

        // ─── Library Modal (Bootstrap Modal API) ───
        $('#openLibraryBtn').on('click', function () {
            renderLibraryModal('');
            SpiceUI.openLibraryModal();
            $('#librarySearch').val('');
            // Focus search after modal is shown
            $('#libraryModal').one('shown.bs.modal', function () {
                $('#librarySearch').focus();
            });
        });

        // Library search
        $('#librarySearch').on('input', function () {
            renderLibraryModal($(this).val());
        });

        // Library card actions
        $(document).on('click', '.lib-load-btn', function (e) {
            e.stopPropagation();
            var name = $(this).data('name');
            loadFromLibrary(name);
            SpiceUI.closeLibraryModal();
        });

        $(document).on('click', '.lib-dl-btn', function (e) {
            e.stopPropagation();
            var name = $(this).data('name');
            var model = SpiceLibrary.getByName(name);
            if (model) {
                SpiceLibrary.downloadModelAsLib(model);
                SpiceUI.showToast('Downloaded ' + name + '.lib', 'success');
            }
        });

        $(document).on('click', '.lib-del-btn', function (e) {
            e.stopPropagation();
            var name = $(this).data('name');
            if (!confirm('Delete "' + name + '" from library?')) return;
            SpiceLibrary.remove(name);
            renderLibraryModal($('#librarySearch').val());
            refreshLibraryDropdown();
            refreshLibCount();
            SpiceUI.showToast('Deleted "' + name + '".', 'success');
        });

        // Download all from modal
        $('#downloadAllFromModal').on('click', function () {
            if (!SpiceLibrary.downloadAllAsLib()) {
                SpiceUI.showToast('No models to download.', 'error');
            } else {
                SpiceUI.showToast('Downloaded spice_library.lib', 'success');
            }
        });

        // Clear all from modal
        $('#clearLibraryBtn').on('click', function () {
            if (!confirm('Delete ALL models from your library? This cannot be undone.')) return;
            SpiceLibrary.clearAll();
            renderLibraryModal('');
            refreshLibraryDropdown();
            refreshLibCount();
            SpiceUI.showToast('Library cleared.', 'success');
        });

        // ─── Export/Import JSON ───
        $('#exportJsonBtn').on('click', function () {
            if (SpiceLibrary.count() === 0) {
                SpiceUI.showToast('No models in library to export.', 'error');
                return;
            }
            SpiceLibrary.downloadAsJSON();
            SpiceUI.showToast('Exported library as JSON.', 'success');
        });

        $('#importJsonBtn').on('click', function () {
            $('#importFileInput').click();
        });

        $('#importFileInput').on('change', function (e) {
            var file = e.target.files[0];
            if (!file) return;

            var reader = new FileReader();
            reader.onload = function (ev) {
                var result = SpiceLibrary.importJSON(ev.target.result);
                refreshLibraryDropdown();
                refreshLibCount();
                SpiceUI.showToast(
                    'Imported: ' + result.imported + ' new, ' + result.updated + ' updated' +
                    (result.errors ? ', ' + result.errors + ' errors' : ''),
                    result.errors ? 'error' : 'success'
                );
            };
            reader.readAsText(file);
            // Reset so the same file can be re-imported
            $(this).val('');
        });
    }

    // ─── Start ──────────────────────────────────────────
    init();
});
