/**
 * ═══════════════════════════════════════════════════════
 *  library.js — JSON-based Model Library Manager
 *  Persists models to localStorage, supports import/export
 *  as JSON files, and generates .lib downloads.
 * ═══════════════════════════════════════════════════════
 */

var SpiceLibrary = (function () {
    'use strict';

    var STORAGE_KEY = 'spice_model_library';

    /**
     * Get all models from storage.
     * @returns {Array}
     */
    function getAll() {
        try {
            var data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Library read error:', e);
            return [];
        }
    }

    /**
     * Save all models to storage.
     * @param {Array} models
     */
    function saveAll(models) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(models));
        } catch (e) {
            console.error('Library save error:', e);
        }
    }

    /**
     * Add or update a model in the library.
     * If a model with the same name exists, it will be updated.
     * @param {Object} model
     * @returns {boolean} true if added, false if updated
     */
    function save(model) {
        var models = getAll();
        var existing = -1;

        for (var i = 0; i < models.length; i++) {
            if (models[i].name.toLowerCase() === model.name.toLowerCase()) {
                existing = i;
                break;
            }
        }

        model.savedAt = new Date().toISOString();

        if (existing >= 0) {
            models[existing] = model;
            saveAll(models);
            return false; // updated
        } else {
            models.push(model);
            saveAll(models);
            return true; // added
        }
    }

    /**
     * Delete a model by name.
     * @param {string} name
     * @returns {boolean}
     */
    function remove(name) {
        var models = getAll();
        var filtered = models.filter(function (m) {
            return m.name.toLowerCase() !== name.toLowerCase();
        });
        if (filtered.length < models.length) {
            saveAll(filtered);
            return true;
        }
        return false;
    }

    /**
     * Get a model by name.
     * @param {string} name
     * @returns {Object|null}
     */
    function getByName(name) {
        var models = getAll();
        for (var i = 0; i < models.length; i++) {
            if (models[i].name.toLowerCase() === name.toLowerCase()) {
                return models[i];
            }
        }
        return null;
    }

    /**
     * Search models by name.
     * @param {string} query
     * @returns {Array}
     */
    function search(query) {
        var q = (query || '').toLowerCase().trim();
        if (!q) return getAll();
        return getAll().filter(function (m) {
            return m.name.toLowerCase().indexOf(q) !== -1 ||
                   m.type.toLowerCase().indexOf(q) !== -1;
        });
    }

    /**
     * Clear all models.
     */
    function clearAll() {
        saveAll([]);
    }

    /**
     * Get count of models.
     * @returns {number}
     */
    function count() {
        return getAll().length;
    }

    /**
     * Export all models as a JSON string (for file download).
     * @returns {string}
     */
    function exportJSON() {
        var data = {
            version: '3.0',
            exportedAt: new Date().toISOString(),
            generator: 'SPICE Model Generator',
            models: getAll()
        };
        return JSON.stringify(data, null, 2);
    }

    /**
     * Import models from a JSON string.
     * Merges with existing library (newer overwrites older).
     * @param {string} jsonStr
     * @returns {Object} { imported: number, updated: number, errors: number }
     */
    function importJSON(jsonStr) {
        var result = { imported: 0, updated: 0, errors: 0 };
        try {
            var data = JSON.parse(jsonStr);
            var incoming = data.models || data;

            if (!Array.isArray(incoming)) {
                incoming = [incoming];
            }

            incoming.forEach(function (model) {
                if (model.name && model.type) {
                    var isNew = save(model);
                    if (isNew) {
                        result.imported++;
                    } else {
                        result.updated++;
                    }
                } else {
                    result.errors++;
                }
            });
        } catch (e) {
            console.error('Import error:', e);
            result.errors++;
        }
        return result;
    }

    /**
     * Download a file to the user's computer.
     * @param {string} content - file content
     * @param {string} filename - file name
     * @param {string} mimeType - MIME type
     */
    function downloadFile(content, filename, mimeType) {
        var blob = new Blob([content], { type: mimeType || 'text/plain' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Download a single model as .lib file.
     * @param {Object} model
     */
    function downloadModelAsLib(model) {
        var result = SpiceEngine.generateModel({
            name: model.name,
            type: model.type,
            spice: model.spice,
            custom: model.custom || [],
            datasheet: model.datasheet || {}
        });
        downloadFile(result.text, model.name + '.lib', 'text/plain');
    }

    /**
     * Download all models as a single .lib file.
     */
    function downloadAllAsLib() {
        var models = getAll();
        if (models.length === 0) return false;
        var content = SpiceEngine.generateLibFile(models);
        downloadFile(content, 'spice_library.lib', 'text/plain');
        return true;
    }

    /**
     * Download library as JSON file.
     */
    function downloadAsJSON() {
        var json = exportJSON();
        downloadFile(json, 'spice_library.json', 'application/json');
    }

    /**
     * Also save to the library/ folder structure (creates JSON files).
     * Since we're browser-only, we generate individual JSON representations
     * that the user can download.
     * @param {Object} model
     * @returns {string} JSON content for this model
     */
    function getModelJSON(model) {
        return JSON.stringify({
            version: '3.0',
            model: model
        }, null, 2);
    }

    return {
        getAll: getAll,
        save: save,
        remove: remove,
        getByName: getByName,
        search: search,
        clearAll: clearAll,
        count: count,
        exportJSON: exportJSON,
        importJSON: importJSON,
        downloadFile: downloadFile,
        downloadModelAsLib: downloadModelAsLib,
        downloadAllAsLib: downloadAllAsLib,
        downloadAsJSON: downloadAsJSON,
        getModelJSON: getModelJSON
    };
})();
