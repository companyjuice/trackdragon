<?php

namespace Roots\Sage\Assets;

/**
 * Scripts and stylesheets
 *
 * Enqueue stylesheets in the following order:
 * 1. /theme/dist/styles/main.css
 *
 * Enqueue scripts in the following order:
 * 1. /theme/dist/scripts/modernizr.js
 * 2. /theme/dist/scripts/main.js
 */

class JsonManifest {
  private $manifest;

  public function __construct($manifest_path) {
    if (file_exists($manifest_path)) {
      $this->manifest = json_decode(file_get_contents($manifest_path), true);
    } else {
      $this->manifest = [];
    }
  }

  public function get() {
    return $this->manifest;
  }

  public function getPath($key = '', $default = null) {
    $collection = $this->manifest;
    if (is_null($key)) {
      return $collection;
    }
    if (isset($collection[$key])) {
      return $collection[$key];
    }
    foreach (explode('.', $key) as $segment) {
      if (!isset($collection[$segment])) {
        return $default;
      } else {
        $collection = $collection[$segment];
      }
    }
    return $collection;
  }
}

function asset_path($filename) {
  $dist_path = get_template_directory_uri() . DIST_DIR;
  $directory = dirname($filename) . '/';
  $file = basename($filename);
  static $manifest;

  if (empty($manifest)) {
    $manifest_path = get_template_directory() . DIST_DIR . 'assets.json';
    $manifest = new JsonManifest($manifest_path);
  }

  if (array_key_exists($file, $manifest->get())) {
    return $dist_path . $directory . $manifest->get()[$file];
  } else {
    return $dist_path . $directory . $file;
  }
}

function assets() {
  
  /* CUSTOM CODE */
  if (is_page('project-huggybear')){
    //wp_enqueue_script('require_js', asset_path('../assets/scripts/require/require.js'));
    wp_enqueue_script('require_js', '//cdnjs.cloudflare.com/ajax/libs/require.js/2.1.15/require.min.js', [], null, false);
    $app_base = '/app/themes/dragon/trackdragon/wae/js';
    wp_localize_script( 'require_js', 'require', array(
        'baseUrl' => $app_base,
        'deps'    => array( $app_base . '/main.js')
    ));
  }
  /* END CUSTOM CODE */

  wp_enqueue_style('sage_css', asset_path('styles/main.css'), false, null);
  
  /* CUSTOM CODE */
  wp_enqueue_style('dragon_css', asset_path('styles/dragon.css'), false, null);
  if (is_page('project-huggybear')){
    wp_enqueue_style('wae_css', asset_path('styles/wae.css'), false, null);
  }
  /* END CUSTOM CODE */

  if (is_single() && comments_open() && get_option('thread_comments')) {
    wp_enqueue_script('comment-reply');
  }
  wp_enqueue_script('modernizr', asset_path('scripts/modernizr.js'), [], null, true);
  wp_enqueue_script('sage_js', asset_path('scripts/main.js'), ['requirejs','jquery'], null, true);

  /* CUSTOM CODE */
  wp_enqueue_script('dragon_js', asset_path('scripts/dragon.js'), ['jquery'], null, true);
  /* END CUSTOM CODE */

}
add_action('wp_enqueue_scripts', __NAMESPACE__ . '\\assets', 100);
