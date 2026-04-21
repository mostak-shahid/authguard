<?php
namespace MosPress\Authguard\Services;
if ( ! defined( 'ABSPATH' ) ) exit;
class Login_redirect
{
	private $options;

	public function __construct()
	{
		$this->options = authguard_get_option();

		if ( ! empty( $this->options['login_redirects']['enabled'] ) ) {
			add_filter( 'login_redirect', [ $this, 'handle_login_redirect' ], 10, 3 );
		}
	}

	public function handle_login_redirect( $redirect_to, $requested_redirect_to, $user )
	{
		if ( is_wp_error( $user ) || ! $user->ID ) {
			return $redirect_to;
		}

		$rule = $this->find_matching_rule( $user );

		if ( $rule && ! empty( $rule['redirect_to'] ) ) {
			$url = $rule['redirect_to'];
			if ( ! preg_match( '/^https?:\/\//i', $url ) ) {
				$url = home_url( $url );
			}
			return esc_url_raw( $url );
		}

		return $redirect_to;
	}

	private function find_matching_rule( $user )
	{
		global $wpdb;
		$table_name = $wpdb->prefix . 'authguard_login_redirects';

		$user_rule = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM {$table_name} WHERE type = 'user' AND value = %s AND status = 'active' ORDER BY ID ASC LIMIT 1",
				$user->ID
			),
			ARRAY_A
		);

		if ( $user_rule ) {
			return $user_rule;
		}

		$user_roles = array_filter( (array) $user->roles );

		if ( ! empty( $user_roles ) ) {
			$placeholders = implode( ',', array_fill( 0, count( $user_roles ), '%s' ) );
			$role_rule = $wpdb->get_row(
				$wpdb->prepare(
					"SELECT * FROM {$table_name} WHERE type = 'role' AND value IN ($placeholders) AND status = 'active' ORDER BY ID ASC LIMIT 1",
					...$user_roles
				),
				ARRAY_A
			);

			if ( $role_rule ) {
				return $role_rule;
			}
		}

		return null;
	}
}
