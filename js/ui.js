/**
 * ═══════════════════════════════════════════════════════
 *  ui.js — UI Utilities: toast, collapse, particles, theme
 * ═══════════════════════════════════════════════════════
 */

var SpiceUI = (function () {
    'use strict';

    var toastTimeout = null;
    var bsModal = null;

    // ─── Theme Toggle ──────────────────────────────────

    /**
     * Initialize the dark/light theme toggle.
     * Reads saved preference from localStorage, applies it,
     * and wires up the toggle button.
     */
    function initThemeToggle() {
        var $btn = $('#themeToggleBtn');
        var savedTheme = localStorage.getItem('sp_theme') || 'dark';

        applyTheme(savedTheme);

        $btn.on('click', function () {
            var current = $('html').attr('data-bs-theme');
            var next = (current === 'dark') ? 'light' : 'dark';
            applyTheme(next);
            localStorage.setItem('sp_theme', next);
        });
    }

    /**
     * Apply a theme by name.
     * @param {string} theme - 'dark' or 'light'
     */
    function applyTheme(theme) {
        $('html').attr('data-bs-theme', theme);

        var $btn = $('#themeToggleBtn');
        var $icon = $btn.find('i');

        if (theme === 'light') {
            $icon.removeClass('fa-moon').addClass('fa-sun');
            $btn.attr('title', 'Switch to dark mode');
        } else {
            $icon.removeClass('fa-sun').addClass('fa-moon');
            $btn.attr('title', 'Switch to light mode');
        }
    }

    // ─── Toast ─────────────────────────────────────────

    /**
     * Show a toast notification.
     * @param {string} msg
     * @param {string} type - 'success', 'error', or ''
     */
    function showToast(msg, type) {
        var $toast = $('#toast');
        $toast.find('.toast-msg').text(msg);
        $toast.removeClass('show success error');

        if (type === 'success') {
            $toast.addClass('success');
            $toast.find('.toast-icon').removeClass().addClass('fa-solid fa-check-circle toast-icon');
        } else if (type === 'error') {
            $toast.addClass('error');
            $toast.find('.toast-icon').removeClass().addClass('fa-solid fa-exclamation-circle toast-icon');
        } else {
            $toast.find('.toast-icon').removeClass().addClass('fa-solid fa-info-circle toast-icon');
        }

        $toast.addClass('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(function () {
            $toast.removeClass('show');
        }, 3000);
    }

    // ─── Bootstrap Modal Helpers ───────────────────────

    /**
     * Get or create the Bootstrap Modal instance for the library modal.
     * @returns {bootstrap.Modal}
     */
    function getLibraryModal() {
        if (!bsModal) {
            var modalEl = document.getElementById('libraryModal');
            bsModal = new bootstrap.Modal(modalEl);
        }
        return bsModal;
    }

    /**
     * Open the library modal.
     */
    function openLibraryModal() {
        getLibraryModal().show();
    }

    /**
     * Close the library modal.
     */
    function closeLibraryModal() {
        getLibraryModal().hide();
    }

    // ─── Collapsible Cards ─────────────────────────────

    /**
     * Initialize card collapse/expand toggles.
     */
    function initCollapsibles() {
        $(document).on('click', '.collapse-btn', function () {
            var $btn = $(this);
            var targetId = $btn.data('target');
            var $body = $('#' + targetId);

            if ($body.hasClass('collapsed')) {
                $body.removeClass('collapsed');
                $btn.removeClass('collapsed');
            } else {
                $body.addClass('collapsed');
                $btn.addClass('collapsed');
            }
        });
    }

    // ─── Background Particles ──────────────────────────

    /**
     * Initialize background particles.
     */
    function initParticles() {
        var $container = $('#bgParticles');
        var colors = [
            'rgba(59, 130, 246, 0.3)',
            'rgba(139, 92, 246, 0.2)',
            'rgba(6, 182, 212, 0.2)',
            'rgba(168, 85, 247, 0.15)'
        ];

        for (var i = 0; i < 20; i++) {
            var size = Math.random() * 3 + 1;
            var $p = $('<div class="particle"></div>');
            $p.css({
                width: size + 'px',
                height: size + 'px',
                background: colors[Math.floor(Math.random() * colors.length)],
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDelay: (Math.random() * 12) + 's',
                animationDuration: (8 + Math.random() * 8) + 's'
            });
            $container.append($p);
        }
    }

    // ─── Utilities ─────────────────────────────────────

    /**
     * Escape HTML to prevent XSS.
     */
    function escHtml(str) {
        return $('<div>').text(str).html();
    }

    return {
        showToast: showToast,
        initThemeToggle: initThemeToggle,
        initCollapsibles: initCollapsibles,
        initParticles: initParticles,
        openLibraryModal: openLibraryModal,
        closeLibraryModal: closeLibraryModal,
        escHtml: escHtml
    };
})();
