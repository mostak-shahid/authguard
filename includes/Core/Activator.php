<?php

namespace MosPress\Authpress\Core;
use MosPress\Authpress\Helpers\CryptoHelper;
/**
 * Fired during plugin activation
 *
 * @link       https://mostak-shahid.github.io/
 * @since      1.0.0
 *
 * @package    Authpress
 * @subpackage Authpress/includes
 */

/**
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation.
 *
 * @since      1.0.0
 * @package    Authpress
 * @subpackage Authpress/includes
 * @author     Programmelab <mostak.shahid@gmail.com>
 */
class Activator
{

	/**
	 * Short Description. (use period)
	 *
	 * Long Description.
	 *
	 * @since    1.0.0
	 */
	public static function activate()
	{
		$authguard_options = authguard_get_option();
		update_option('authguard_options', $authguard_options);
		add_option('authguard_do_activation_redirect', true);

		self::create_logs_table();
		self::create_login_redirects_table();
		self::create_2fa_logs_table();

		// Check if OpenSSL is available
        if ( ! CryptoHelper::is_encryption_available() ) {
            wp_die(
                esc_html__( 'OpenSSL is required but not available on your server. Please contact your hosting provider.', 'authguard' ),
                esc_html__( 'Plugin Activation Error', 'authguard' ),
                array( 'back_link' => true )
            );
        }

        // Generate random 8-digit string
        $random_key = CryptoHelper::generate_random_string( 8 );

        // Encrypt the key
        $encrypted_key = CryptoHelper::encrypt( $random_key );

        if ( false === $encrypted_key ) {
            wp_die(
                esc_html__( 'Failed to generate secure deactivation key. Please try again.', 'authguard' ),
                esc_html__( 'Plugin Activation Error', 'authguard' ),
                array( 'back_link' => true )
            );
        }

        // Store the encrypted key in options
        update_option( 'authguard_deactive_key', $encrypted_key, false );

        // Log activation if debugging is enabled
        // if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
        //     error_log( 'AuthGuard activated with secure deactivation key' );
        // }

        // Flush rewrite rules
        flush_rewrite_rules();

        // Set activation flag for any one-time notices
        set_transient( 'authguard_activation_notice', true, 30 );
	}

	private static function create_logs_table()
	{
		global $wpdb;
		$table_name = $wpdb->prefix . 'authguard_logs';
		$charset_collate = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE $table_name (
			ID bigint(20) NOT NULL AUTO_INCREMENT,
			user_id bigint(20) NOT NULL,
			ip varchar(45) NOT NULL,
			user_agent text NOT NULL,
			title varchar(255) NOT NULL,
			category varchar(45) NOT NULL,
			description longtext NOT NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (ID)
		) $charset_collate;";

		require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
		dbDelta($sql);
	}
	private static function create_login_redirects_table()
	{
		global $wpdb;
		$table_name = $wpdb->prefix . 'authguard_login_redirects';
		$charset_collate = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE $table_name (
			ID bigint(20) NOT NULL AUTO_INCREMENT,
			user_id bigint(20) NOT NULL,
			type varchar(45) NOT NULL,
			value varchar(45) NOT NULL,
			redirect_to varchar(255) NOT NULL,
			status varchar(45) NOT NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (ID)
		) $charset_collate;";

		require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
		dbDelta($sql);
	}
	private static function create_2fa_logs_table()
	{
		global $wpdb;
		$table_name = $wpdb->prefix . 'authguard_2fa_logs';
		$charset_collate = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE $table_name (
			ID            BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
			user_id       BIGINT(20) UNSIGNED NOT NULL,
			method        ENUM('email', 'sms', 'whatsapp', 'totp', 'hotp', 'backup_code') NOT NULL,
			status        ENUM('sent', 'verified', 'failed', 'expired') NOT NULL,
			code_hash     VARCHAR(255) DEFAULT NULL,
			expires_at    DATETIME DEFAULT NULL,
			verified_at   DATETIME DEFAULT NULL,
			ip_address    VARCHAR(45) DEFAULT NULL,
			user_agent    TEXT DEFAULT NULL,
			attempts      TINYINT(3) UNSIGNED NOT NULL DEFAULT 0,
			created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at	  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
					
			PRIMARY KEY (ID),
			KEY user_id (user_id),
			KEY status (status),
			KEY method (method),
			KEY expires_at (expires_at)
		) $charset_collate;";

		require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
		dbDelta($sql);
	}
}



