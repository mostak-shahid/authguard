<?php
namespace MosPress\Authguard\Services;
if ( ! defined( 'ABSPATH' ) ) exit;
class Login_redirect
{

	public function __construct()
	{
		$options = authguard_get_option();
	}
}