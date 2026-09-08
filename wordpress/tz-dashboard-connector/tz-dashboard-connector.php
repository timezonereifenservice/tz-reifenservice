<?php
/**
 * Plugin Name: TZ Dashboard Connector
 * Description: Sends page views, CTA clicks, and form leads from timezone-reifenservice.de to the custom analytics dashboard.
 * Version: 1.0.0
 * Author: Time Zone Reifenservice
 * Text Domain: tz-dashboard-connector
 */

if (!defined('ABSPATH')) {
    exit;
}

define('TZ_DASHBOARD_VERSION', '1.0.0');
define('TZ_DASHBOARD_OPTION_KEY', 'tz_dashboard_settings');

/**
 * Default settings — configure in WP Admin → Einstellungen → TZ Dashboard
 */
function tz_dashboard_default_settings() {
    return [
        'dashboard_url' => 'https://your-dashboard.vercel.app',
        'api_key'       => '',
        'track_cta'     => '1',
        'track_forms'   => '1',
    ];
}

function tz_dashboard_get_settings() {
    return wp_parse_args(get_option(TZ_DASHBOARD_OPTION_KEY, []), tz_dashboard_default_settings());
}

function tz_dashboard_api_headers($settings) {
    $headers = ['Content-Type' => 'application/json'];
    if (!empty($settings['api_key'])) {
        $headers['X-TZ-API-Key'] = $settings['api_key'];
    }
    return $headers;
}

function tz_dashboard_post($endpoint, $payload) {
    $settings = tz_dashboard_get_settings();
    $base = rtrim($settings['dashboard_url'], '/');
    if (empty($base)) {
        return false;
    }

    wp_remote_post($base . $endpoint, [
        'timeout' => 8,
        'headers' => tz_dashboard_api_headers($settings),
        'body'    => wp_json_encode($payload),
    ]);
}

function tz_dashboard_send_analytics($payload) {
    tz_dashboard_post('/api/wordpress/analytics', $payload);
}

function tz_dashboard_send_lead($payload) {
    $settings = tz_dashboard_get_settings();
    if ($settings['track_forms'] !== '1') {
        return;
    }
    tz_dashboard_post('/api/wordpress/leads', $payload);
}

/** Admin settings page */
function tz_dashboard_register_settings() {
    register_setting(TZ_DASHBOARD_OPTION_KEY, TZ_DASHBOARD_OPTION_KEY);

    add_options_page(
        'TZ Dashboard',
        'TZ Dashboard',
        'manage_options',
        'tz-dashboard',
        'tz_dashboard_settings_page'
    );
}
add_action('admin_menu', 'tz_dashboard_register_settings');

function tz_dashboard_settings_page() {
    $settings = tz_dashboard_get_settings();
    ?>
    <div class="wrap">
        <h1>TZ Dashboard Connector</h1>
        <form method="post" action="options.php">
            <?php settings_fields(TZ_DASHBOARD_OPTION_KEY); ?>
            <table class="form-table">
                <tr>
                    <th><label for="dashboard_url">Dashboard URL</label></th>
                    <td>
                        <input type="url" id="dashboard_url" name="<?php echo esc_attr(TZ_DASHBOARD_OPTION_KEY); ?>[dashboard_url]"
                               value="<?php echo esc_attr($settings['dashboard_url']); ?>" class="regular-text"
                               placeholder="https://your-dashboard.vercel.app" />
                    </td>
                </tr>
                <tr>
                    <th><label for="api_key">API Key</label></th>
                    <td>
                        <input type="password" id="api_key" name="<?php echo esc_attr(TZ_DASHBOARD_OPTION_KEY); ?>[api_key]"
                               value="<?php echo esc_attr($settings['api_key']); ?>" class="regular-text" />
                        <p class="description">Must match WORDPRESS_API_KEY on the dashboard server.</p>
                    </td>
                </tr>
                <tr>
                    <th>Track CTA clicks</th>
                    <td>
                        <label>
                            <input type="checkbox" name="<?php echo esc_attr(TZ_DASHBOARD_OPTION_KEY); ?>[track_cta]" value="1"
                                <?php checked($settings['track_cta'], '1'); ?> />
                            WhatsApp, Anruf, Kontakt-Buttons
                        </label>
                    </td>
                </tr>
                <tr>
                    <th>Track form leads</th>
                    <td>
                        <label>
                            <input type="checkbox" name="<?php echo esc_attr(TZ_DASHBOARD_OPTION_KEY); ?>[track_forms]" value="1"
                                <?php checked($settings['track_forms'], '1'); ?> />
                            Contact Form 7 / WPForms submissions
                        </label>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

/** Frontend tracking script */
function tz_dashboard_enqueue_tracker() {
    if (is_admin()) {
        return;
    }

    $settings = tz_dashboard_get_settings();
    if (empty($settings['dashboard_url'])) {
        return;
    }

    wp_enqueue_script(
        'tz-dashboard-tracker',
        plugins_url('assets/tracker.js', __FILE__),
        [],
        TZ_DASHBOARD_VERSION,
        true
    );

    wp_localize_script('tz-dashboard-tracker', 'TZDashboard', [
        'dashboardUrl' => rtrim($settings['dashboard_url'], '/'),
        'apiKey'       => $settings['api_key'],
        'trackCta'     => $settings['track_cta'] === '1',
        'path'         => wp_parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/',
        'referrer'     => wp_get_referer() ?: '',
    ]);
}
add_action('wp_enqueue_scripts', 'tz_dashboard_enqueue_tracker');

/** Hook Contact Form 7 submissions */
function tz_dashboard_cf7_lead($contact_form) {
    $submission = WPCF7_Submission::get_instance();
    if (!$submission) {
        return;
    }

    $data = $submission->get_posted_data();
    tz_dashboard_send_lead([
        'formKey'     => 'contact-form-cf7-' . $contact_form->id(),
        'sourceLabel' => 'Contact Form 7',
        'sourcePage'  => wp_parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/',
        'fullName'    => $data['your-name'] ?? $data['name'] ?? '',
        'email'       => $data['your-email'] ?? $data['email'] ?? '',
        'phone'       => $data['your-phone'] ?? $data['tel'] ?? '',
        'message'     => $data['your-message'] ?? $data['message'] ?? '',
        'service'     => $data['your-subject'] ?? $data['service'] ?? '',
        'type'        => 'contact',
    ]);
}
add_action('wpcf7_mail_sent', 'tz_dashboard_cf7_lead');

/** Hook generic form submissions via filter (extend as needed) */
function tz_dashboard_generic_lead($lead_data) {
    if (!is_array($lead_data)) {
        return $lead_data;
    }
    tz_dashboard_send_lead($lead_data);
    return $lead_data;
}
add_filter('tz_dashboard_lead', 'tz_dashboard_generic_lead');
