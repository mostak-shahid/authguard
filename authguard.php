<?php

/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              https://mostak-shahid.github.io/
 * @since             1.0.0
 * @package           Authguard
 *
 * @wordpress-plugin
 * Plugin Name:       AuthGuard
 * Plugin URI:        https://mostak-shahid.github.io/plugins/authguard.html
 * Description:       AuthGuard is a powerful WordPress Login Page Customizer that lets you fully redesign the wp-login page, register form, and forgot password screen while enhancing security and user experience.
 * Version:           1.0.0
 * Author:            Md. Mostak Shahid
 * Author URI:        https://mostak-shahid.github.io/
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       authguard
 * Domain Path:       /languages
 */

defined('ABSPATH') || exit;
/**
 * Currently plugin version.
 * Start at version 1.0.0 and use SemVer - https://semver.org
 * Rename this for your plugin and update it as you release new versions.
 */
define('AUTHGUARD_VERSION', '1.0.0');
define('AUTHGUARD_NAME', 'AuthGuard');
define('AUTHGUARD_PATH', plugin_dir_path(__FILE__));
define('AUTHGUARD_URL', plugin_dir_url(__FILE__));
define('AUTHGUARD_MAIN_FILE', __FILE__);

require_once AUTHGUARD_PATH . '/vendor/autoload.php';
require_once AUTHGUARD_PATH . '/authguard-functions.php';

/**
 * The code that runs during plugin activation.
 * This action is documented in src/Core/Activator.php
 */
function authguard_activate()
{
	\MosPress\Authguard\Core\Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in src/Core/Deactivator.php
 */
function authguard_deactivate()
{
	\MosPress\Authguard\Core\Deactivator::deactivate();
}

register_activation_hook(__FILE__, 'authguard_activate');
register_deactivation_hook(__FILE__, 'authguard_deactivate');


/**
 * Register WP-CLI commands only if file exists
 */
if ( defined( 'WP_CLI' ) && WP_CLI && file_exists( plugin_dir_path( __FILE__ ) . 'includes/CLI/CLI_Command.php' ) ) {
    $cli_file = plugin_dir_path( __FILE__ ) . 'includes/CLI/CLI_Command.php';

    if ( file_exists( $cli_file ) ) {
        WP_CLI::add_command( 'authguard', 'MosPress\Authguard\CLI\CLI_Command' );
    }
}

use MosPress\Authguard\Plugin;

// Plugin::get_instance();
new Plugin();