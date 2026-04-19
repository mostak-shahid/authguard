<?php
/**
 * Uninstall Plugin
 *
 * Fired when the plugin is uninstalled (deleted from WordPress admin).
 * This file is called automatically by WordPress.
 *
 * @package Authpress
 */

// If uninstall not called from WordPress, exit
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}
$options = get_option('authguard_options', []);
if (isset($options['tools']['delete_data_on']) && $options['tools']['delete_data_on'] == 'delete') {
    authguard_data_cleanup();
}