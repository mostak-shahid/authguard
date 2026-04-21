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

    function buildNoticeHTML(errors, isLogin) {
        if (errors.length === 0) {
            if (isLogin) {
                return '<div class="authguard-pw-notice authguard-pw-valid">' +
                    authguardPasswordPolicies.i18n.password_ok +
                    '</div>';
            }
            return '<div class="authguard-pw-notice authguard-pw-valid">' +
                '<span class="dashicons dashicons-yes-alt"></span> ' +
                authguardPasswordPolicies.i18n.password_ok +
                '</div>';
        }

        var html;

        if (isLogin) {
            html = '<div class="authguard-pw-notice authguard-pw-invalid">' +
                '<p class="authguard-pw-heading"><strong>' + authguardPasswordPolicies.i18n.heading + '</strong></p>' +
                '<ul class="authguard-pw-rules">';
            for (var i = 0; i < errors.length; i++) {
                html += '<li>' + errors[i] + '</li>';
            }
            html += '</ul></div>';
        } else {
            html = '<div class="authguard-pw-notice authguard-pw-invalid">' +
                '<p class="authguard-pw-heading"><strong>' + authguardPasswordPolicies.i18n.heading + '</strong></p>' +
                '<ul class="authguard-pw-rules">';
            for (var j = 0; j < errors.length; j++) {
                html += '<li><span class="dashicons dashicons-dismiss"></span> ' + errors[j] + '</li>';
            }
            html += '</ul></div>';
        }

        return html;
    }

    function isLoginPage() {
        return $('#loginform').length > 0 || $('.login').length > 0;
    }

    function findInsertPoint($field) {
        var $wpPwd = $field.closest('.wp-pwd');
        if ($wpPwd.length) {
            return $wpPwd;
        }

        var $passwordWrap = $field.closest('.password-input-wrapper');
        if ($passwordWrap.length) {
            return $passwordWrap;
        }

        return $field;
    }

    function getOrCreateNoticeEl($field) {
        var $insertAfter = findInsertPoint($field);
        var $notice = $insertAfter.next('.authguard-pw-notice');

        if ($notice.length === 0) {
            $notice = $('<div class="authguard-pw-notice"></div>');
            $insertAfter.after($notice);
        }

        return $notice;
    }

    function attachToField(selector) {
        var $field = $(selector);
        if ($field.length === 0) return;

        var loginPage = isLoginPage();
        var $notice = getOrCreateNoticeEl($field);

        $field.off('input.authguard blur.authguard');

        $field.on('input.authguard', function () {
            var password = $(this).val();
            if (password.length === 0) {
                $notice.html('');
                return;
            }
            var errors = validatePassword(password);
            $notice.html(buildNoticeHTML(errors, loginPage));
        });

        $field.on('blur.authguard', function () {
            var password = $(this).val();
            if (password.length > 0) {
                var errors = validatePassword(password);
                $notice.html(buildNoticeHTML(errors, loginPage));
            }
        });
    }

    $(document).ready(function () {
        attachToField('input#pass1');
        attachToField('input#password');
    });

    $(document).on('page-password-field-ready authguard-check-password', function () {
        attachToField('input#pass1');
        attachToField('input#password');
    });

    setTimeout(function () {
        attachToField('input#pass1');
        attachToField('input#password');
    }, 1000);

})(jQuery);
