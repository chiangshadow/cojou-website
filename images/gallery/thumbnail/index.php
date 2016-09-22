<?php
header('HTTP/1.1 301 Moved Permanently');
$domainip = $_SERVER['HTTP_HOST'];
header("Location: http://$domainip");
?>
