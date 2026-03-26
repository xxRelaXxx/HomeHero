<?php
// Minimal router for PHP built-in server: serve static files if present
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$file = __DIR__ . $uri;
if ($uri !== '/' && file_exists($file) && is_file($file)) {
    return false; // let the webserver serve the requested resource
}

require __DIR__ . '/index.php';
