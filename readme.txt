=== AuthGuard ===
Contributors: mostakshahid
Tags: login customizer, custom login, login page, authentication, security, 2fa, two-factor, login redirect, limit login, hide login, captcha, wordpress login, wp-login
Requires at least: 5.8
Tested up to: 6.9
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.txt

Transform your WordPress login experience with AuthGuard - the ultimate login page customizer and security suite. Redesign your login, registration, and password reset screens with full visual control while protecting your site with powerful security features.

== Description ==

AuthGuard is a powerful WordPress Login Page Customizer that lets you fully redesign the wp-login page, register form, and forgot password screen while enhancing security and user experience.

=== Visual Customization ===

* **Background Customization** - Choose from solid colors, gradients, images, or video backgrounds with overlay effects
* **Logo Control** - Replace the default WordPress logo with your own branding, adjust size and spacing
* **Form Styling** - Customize form wrapper, input fields, and submit buttons with full CSS control
* **Glass Morphism Effects** - Add modern glass/blur effects to form elements
* **Typography Control** - Style labels and placeholders with font properties
* **Positioning** - Position login form left, right, or center on the page

=== Security Features ===

* **Two-Factor Authentication (2FA)** - Email-based 2FA with 6-digit codes, configurable expiration, and attempt limiting
* **Limit Login Attempts** - Protect against brute force attacks with IP and email blacklists, configurable lockout duration, and attempt limits
* **Hide Login Page** - Redirect default wp-login.php to a custom URL to hide from bots
* **Math Captcha** - Add simple math challenges to prevent automated submissions
* **Disable Features** - Optionally disable remember me, lost password, registration, and privacy policy links

=== User Management ===

* **Role-based Redirects** - Redirect users after login based on their role (admin, editor, author, etc.)
* **Auto Login** - Enable automatic login for specific scenarios like email verification links
* **Login by Method** - Force users to login with username only, email only, or both
* **Registration with Password** - Allow users to set their password during registration instead of receiving an email

=== Developer Features ===

* **PSR-4 Architecture** - Clean, modular code structure following WordPress coding standards
* **REST API** - Comprehensive API endpoints for settings management
* **WP-CLI Commands** - Manage plugin functionality from command line
* **Import/Export** - Backup and restore plugin settings
* **Extensive Hooks** - Action and filter hooks for customization without modifying core files

== Installation ==

=== From WordPress.org Plugin Directory ===

1. Log in to your WordPress admin panel
2. Navigate to Plugins → Add New
3. Search for "AuthGuard"
4. Click "Install Now" and then "Activate"

=== Manual Upload ===

1. Download the authguard.zip file
2. Log in to your WordPress admin panel
3. Navigate to Plugins → Add New → Upload Plugin
4. Choose the authguard.zip file and click "Install Now"
5. Click "Activate Plugin"

=== FTP/SFTP ===

1. Download and extract the authguard.zip file
2. Upload the `authguard` folder to the `/wp-content/plugins/` directory
3. Log in to your WordPress admin panel
4. Navigate to Plugins and activate "AuthGuard"

== Frequently Asked Questions ==

= Does this plugin work with all WordPress themes? =

Yes, AuthGuard is designed to work with any WordPress theme. The login customizations only affect the wp-login.php page and don't interfere with your theme's design.

= Can I customize the login page for specific user roles? =

Currently, customizations apply globally to all users. However, you can configure role-based redirects after login, which can create different experiences for different user types.

= What happens if I deactivate the plugin? =

If you deactivate AuthGuard, your login page will revert to the default WordPress login design. However, your settings are preserved in the database and will be restored if you reactivate the plugin.

= Is 2FA authentication mandatory for all users? =

No, you can enable or disable 2FA from the plugin settings. When enabled, you can also choose to bypass 2FA for administrators if needed.

= Will hiding the login page break my site's functionality? =

No, the hide login feature simply redirects the default wp-login.php to a custom URL. As long as you provide the custom URL to your users, they can still access the login form. Logged-in users and specific actions (like password reset) are exempted from the redirect.

= Can I use this plugin on multiple sites? =

Yes, you can install AuthGuard on unlimited WordPress sites. If you have a multisite installation, you may want to consider network activation for consistent settings across all sites.

= Does the math captcha support accessibility? =

The math captcha uses simple text-based questions that can be read by screen readers. However, for full WCAG compliance, you may want to review the specific challenges provided.

== Screenshots ==

1. Dashboard overview showing all plugin modules
2. Login Customizer settings with visual preview
3. Two-Factor Authentication configuration
4. Limit Login Attempts settings with blacklist management
5. Role-based redirect configuration
6. Import/Export settings panel

== Changelog ==

= 1.0.0 =
* Initial release
* Login page customizer with background, logo, form, and button styling
* Two-Factor Authentication (2FA) with email verification
* Limit Login Attempts with IP and email blacklists
* Hide Login Page with custom URL support
* Math Captcha for login, registration, and password reset
* Auto Login functionality
* Login Redirects with role-based configuration
* Import/Export settings
* PSR-4 architecture with REST API and WP-CLI support

== Upgrade Notice ==

No special upgrade steps required for this version. Simply update through your WordPress admin panel or download and upload the new version.

== Other Notes ==

For the latest updates, documentation, and support, please visit:
* Plugin Homepage: https://mostak-shahid.github.io/plugins/authguard.html
* GitHub Repository: https://github.com/mostak-shahid/authguard

== Credits ==

Developed by Md. Mostak Shahid
* Website: https://mostak-shahid.github.io/
* Email: mostak.shahid@gmail.com

This plugin follows WordPress coding standards and best practices for security and performance.