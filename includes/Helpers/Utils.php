<?php
namespace MosPress\Authpress\Helpers;

class Utils {

	public static function get_client_ip()
	{
		if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
			return sanitize_text_field( wp_unslash($_SERVER['HTTP_CLIENT_IP']));
		} elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
			return sanitize_text_field( wp_unslash($_SERVER['HTTP_X_FORWARDED_FOR']));
		} elseif (!empty($_SERVER['REMOTE_ADDR'])) {
			return sanitize_text_field( wp_unslash($_SERVER['REMOTE_ADDR']));
		}
	}
}