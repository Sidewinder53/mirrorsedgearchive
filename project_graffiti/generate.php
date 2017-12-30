<?php

$ref = $_SERVER['HTTP_REFERER'];
$refData = parse_url($ref);

if($refData['host'] !== 'mirrorsedgearchive.de') {
	die("Unauthorized request");
	exit();
}

$emblem="";
$frame="";
$background="";
$bgX="";
$bgY="";
$em="";

function clean($string) {
	return preg_replace("/[^a-zA-Z0-9\/_ .\-]/", '', $string);
}

if (isset($_POST['emblem'])) {
	$emblem = clean($_POST['emblem']);
}

if (isset($_POST['frame'])) {
	$frame = clean($_POST['frame']);
}

if (isset($_POST['background'])) {
	$background = clean($_POST['background']);
}

if (isset($_POST['bgX'])) {
	$bgX = clean($_POST['bgX']);
}

if (isset($_POST['bgY'])) {
	$bgY = clean($_POST['bgY']);
}

if (isset($_POST['em'])) {
	$em = clean($_POST['em']);
}

if (isset($_POST['unused'])) {
	$unused = clean($_POST['unused']);
}
if (isset($_POST['version'])) {
	$version = clean($_POST['version']);
}

if ($version < "2") {
	die("deprecated");
}

$ch = curl_init('https://mirrorsedgearchive.de/project_graffiti/a7e93kdfn0uztu8r6/mectagmaker.php');

$post = [
	'emblem'		=> $emblem,
	'frame'			=> $frame,
	'background'	=> $background,
	'bgX'			=> $bgX,
	'bgY'			=> $bgY,
	'em'			=> $em,
	'unused'		=> $unused,
	'passphrase'	=> "D7xIw857G057WrWLNzeb"
];

curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
echo $result;
curl_close($ch);
?>