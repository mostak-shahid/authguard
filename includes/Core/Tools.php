<?php

namespace MosPress\Authguard\Core;
if ( ! defined( 'ABSPATH' ) ) exit;
use MosPress\Authguard\API\Ajax_API;
use MosPress\Authguard\Hook\Filter_Hook;
use MosPress\Authguard\Hook\Action_Hook;
use MosPress\Authguard\Core\Deactivator;
class Tools
{
    protected $options;

	public function __construct()
	{
		$this->options = authguard_get_option();
        if (isset($this->options['tools']['hide_plugin']) && $this->options['tools']['hide_plugin'] == 1) {
            // Hide plugin from plugins list
            add_filter('all_plugins', 'authguard_hide_plugin_from_list');
        }
        if (isset($this->options['tools']['self_defense']) && $this->options['tools']['self_defense'] == 1) {
            add_action('admin_footer', [Action_Hook::class, 'authguard_deactivation_scripts']);
            // AJAX handler to verify password
            add_action('wp_ajax_verify_user_password', [Ajax_API::class, 'verify_user_password_ajax']);
        }

        // if (isset($this->options['tools']['delete_data_on']) && $this->options['tools']['delete_data_on'] == 'deactivate') {
        //     // Cleaning up on Deactive
        // } else if (isset($this->options['tools']['delete_data_on']) && $this->options['tools']['delete_data_on'] == 'delete') {
        //     // Cleaning up on Delete
        // }

        add_action('wp_ajax_authguard_reset_all_settings', [Ajax_API::class, 'authguard_reset_all_settings']);	
        
    }
}