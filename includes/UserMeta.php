<?php

namespace MosPress\Authguard;

defined('ABSPATH') || exit;

class UserMeta {

    public function __construct() {
        add_action('admin_enqueue_scripts', [$this, 'enqueue_profile_assets']);

        add_action('show_user_profile', [$this, 'render_field']);
        add_action('edit_user_profile', [$this, 'render_field']);

        add_action('personal_options_update', [$this, 'save_field']);
        add_action('edit_user_profile_update', [$this, 'save_field']);
    }


    public function enqueue_profile_assets($hook) {

        // Only load on profile pages
        if ($hook !== 'profile.php' && $hook !== 'user-edit.php') {
            return;
        }

        // wp_enqueue_style(
        //     'authguard-profile',
        //     plugins_url('assets/profile.css', dirname(__FILE__)),
        //     [],
        //     filemtime(plugin_dir_path(dirname(__FILE__)) . 'assets/profile.css')
        // );

        wp_enqueue_script(
            'authguard-profile',
            plugins_url('assets/build/profile.js', dirname(__FILE__)),
            ['jquery'],
            // filemtime(plugin_dir_path(dirname(__FILE__)) . 'assets/profile.js'),
            time(),
            true
        );
    }

    /**
     * Render custom field
     */
    public function render_field($user) {
        ?>
        <h2><?php echo esc_html__('AuthGuard Info', 'authguard'); ?></h2>
        <div id="authguard-profile-react-app"></div>
        <?php wp_nonce_field( 'mos_email_form_action', 'mos_email_form_field' ); ?>
        <table class="form-table">
            <tr>
                <th>
                    <label for="authguard_company">
                        <?php echo esc_html__('Company Name', 'authguard'); ?>
                    </label>
                </th>
                <td>
                    <input 
                        type="text" 
                        name="authguard_company" 
                        id="authguard_company"
                        value="<?php echo esc_attr(get_user_meta($user->ID, 'authguard_company', true)); ?>"
                        class="regular-text"
                    />
                    <p class="description">
                        <?php echo esc_html__('Enter the user\'s company name.', 'authguard'); ?>
                    </p>
                </td>
            </tr>
        </table>
        <?php
    }

    /**
     * Save custom field
     */
    public function save_field($user_id) {

        if (!current_user_can('edit_user', $user_id)) {
            return;
        }
        if ( isset( $_POST['mos_email_form_field'] ) && wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['mos_email_form_field'])), 'mos_email_form_action' ) ) {
            $authguard_company = isset($_POST['authguard_company']) ? sanitize_text_field(wp_unslash($_POST['authguard_company'])) : '';            
            update_user_meta(
                $user_id,
                'authguard_company',
                $authguard_company
            );
            
        }
    }
}
