(function ($) {
    'use strict';

    if (typeof authguardPasswordPolicies === 'undefined') {
        return;
    }

    var rules = authguardPasswordPolicies.rules || {};
    var enabled = authguardPasswordPolicies.enabled || false;

    if (!enabled) {
        return;
    }

    function validatePassword(password) {
        var errors = [];

        if (rules.min_length && password.length < parseInt(rules.min_length, 10)) {
            errors.push(authguardPasswordPolicies.i18n.min_length.replace('%d', rules.min_length));
        }

        if (rules.require_uppercase && !/[A-Z]/.test(password)) {
            errors.push(authguardPasswordPolicies.i18n.uppercase);
        }

        if (rules.require_number && !/[0-9]/.test(password)) {
            errors.push(authguardPasswordPolicies.i18n.number);
        }

        if (rules.require_special && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push(authguardPasswordPolicies.i18n.special);
        }

        return errors;
    }

    function buildNoticeHTML(errors) {
        if (errors.length === 0) {
            return '<div class="authguard-pw-notice authguard-pw-valid">' +
                '<span class="dashicons dashicons-yes-alt"></span> ' +
                authguardPasswordPolicies.i18n.password_ok +
                '</div>';
        }

        var html = '<div class="authguard-pw-notice authguard-pw-invalid">' +
            '<p class="authguard-pw-heading"><strong>' + authguardPasswordPolicies.i18n.heading + '</strong></p>' +
            '<ul class="authguard-pw-rules">';

        for (var i = 0; i < errors.length; i++) {
            html += '<li><span class="dashicons dashicons-dismiss"></span> ' + errors[i] + '</li>';
        }

        html += '</ul></div>';
        return html;
    }

    function getOrCreateNoticeEl($field) {
        var $notice = $field.next('.authguard-pw-notice');

        if ($notice.length === 0) {
            $notice = $('<div class="authguard-pw-notice"></div>');
            $field.after($notice);
        }

        return $notice;
    }

    function attachToField(selector) {
        var $field = $(selector);
        if ($field.length === 0) return;

        var $notice = getOrCreateNoticeEl($field);

        $field.off('input.authguard').on('input.authguard', function () {
            var password = $(this).val();
            if (password.length === 0) {
                $notice.html('');
                return;
            }
            var errors = validatePassword(password);
            $notice.html(buildNoticeHTML(errors));
        });

        $field.off('blur.authguard').on('blur.authguard', function () {
            var password = $(this).val();
            if (password.length > 0) {
                var errors = validatePassword(password);
                $notice.html(buildNoticeHTML(errors));
            }
        });
    }

    $(document).ready(function () {
        attachToField('input#pass1');
        attachToField('input#password');

        // Support for user-new.php password field
        setTimeout(function () {
            attachToField('input#pass1');
            attachToField('input#password');
        }, 500);
    });

    $(document).on('page-password-field-ready', function () {
        attachToField('input#pass1');
        attachToField('input#password');
    });

})(jQuery);
