/**
 * ═══════════════════════════════════════════════════════
 *  ui.js — UI Utilities: toast, collapse, particles
 * ═══════════════════════════════════════════════════════
 */

var SpiceUI = (function () {
    'use strict';

    var toastTimeout = null;

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

    /**
     * Escape HTML to prevent XSS.
     */
    function escHtml(str) {
        return $('<div>').text(str).html();
    }

    return {
        showToast: showToast,
        initCollapsibles: initCollapsibles,
        initParticles: initParticles,
        escHtml: escHtml
    };
})();
