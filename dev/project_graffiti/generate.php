<?php

$ref = $_SERVER['HTTP_REFERER'];
$refData = parse_url($ref);

if($refData['host'] !== 'mirrorsedgearchive.de' && $refData['host'] !== 'www.mirrorsedgearchive.de') {
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

function modPath($string) {
	return str_replace('/assets/media/image/project_graffiti/thumbnails/', '', $string);
}

if (isset($_POST['emblem'])) {
	$emblem = modPath(clean($_POST['emblem']));
}

if (isset($_POST['frame'])) {
	$frame = modPath(clean($_POST['frame']));
}

if (isset($_POST['background'])) {
	$background = modPath(clean($_POST['background']));
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

if ($version < "3") {
	die("deprecated");
}

$bgXY = $bgX.'x'.$bgY;

$random = substr(str_shuffle('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),0, 1) . substr(str_shuffle('aBcEeFgHiJkLmNoPqRstUvWxYz0123456789'),0, 10);

$old_path = getcwd();
chdir('/var/www/mirrorsedgearchive_de/www/mectagmaker');
exec("./mectagmaker.sh $emblem $frame $background $random bgresize=$bgXY emresize=$em unused=$unused");
chdir($old_path);
//$im = imagecreatefrompng("/dev/shm/mectagmaker-output-$random.png");

//Posting image to uguu.se
$ch = curl_init('https://uguu.se/api.php?d=upload-tool');
$file = new CURLFile("/dev/shm/mectagmaker-output-$random.png", 'image/png', '/dev/shm/mectagmaker-output.png');
$data = array('file' => $file);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
$response = curl_exec($ch);
$exturl=rtrim($response, '1');
echo $exturl;
//exec("rm /dev/shm/mectagmaker-output-$random.png");
exit();
?>