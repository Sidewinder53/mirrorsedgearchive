<?php

function clean($string) {
	return preg_replace("/[^a-zA-Z0-9\/_ .\-]/", '', $string);
}

$emblem="";
$frame="";
$background="";
$bgX="";
$bgY="";
$em="";
$passphrase="";
$unused="";

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

if (isset($_POST['passphrase'])) {
	$passphrase = clean($_POST['passphrase']);
}

if($passphrase != 'D7xIw857G057WrWLNzeb'){
	die("Unauthorized request");
}

if (isset($_POST['unused'])) {
        $unused = clean($_POST['unused']);
}


$bgXY = $bgX.'x'.$bgY;

$random = substr(str_shuffle('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),0, 1) . substr(str_shuffle('aBcEeFgHiJkLmNoPqRstUvWxYz0123456789'),0, 10);

$old_path = getcwd();
chdir('/webworks/mectagmaker');
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
exec("rm /dev/shm/mectagmaker-output-$random.png");
exit();


//header('Content-Type: image/png');

//imagepng($im);
//imagedestroy($im);

//echo 'Emblem: '.$emblem.'<br><br>Frame: '.$frame.'<br><br>Background: '.$background
//echo base64_encode(file_get_contents("/dev/shm/mectagmaker-output.png"));

?>
