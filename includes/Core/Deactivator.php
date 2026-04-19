<?php

namespace MosPress\Authguard\Core;

/**
 * Fired during plugin deactivation
 *
 * @link       https://mostak-shahid.github.io/
 * @since      1.0.0
 *
 * @package    Authguard
 * @subpackage Authguard/includes
 */

/**
 * Fired during plugin deactivation.
 *
 * This class defines all code necessary to run during the plugin's deactivation.
 *
 * @since      1.0.0
 * @package    Authguard
 * @subpackage Authguard/includes
 * @author     Programmelab <mostak.shahid@gmail.com>
 */
class Deactivator
{
    /**
     * Run on plugin deactivation.
     *
     * This function is called when the plugin is deactivated.
     * It handles cleanup of custom tables and options.
     */
    public static function deactivate() {
        $options = get_option('authguard_options', []);
        if (isset($options['tools']['delete_data_on']) && $options['tools']['delete_data_on'] == 'deactivate') {
            authguard_data_cleanup();
        }
        flush_rewrite_rules();
    }
}



