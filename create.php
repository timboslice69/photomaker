<?php

$dir = 'media/generated/';

function cleanup($dir){
	$fi = new FilesystemIterator($dir, FilesystemIterator::SKIP_DOTS);
	$count = iterator_count($fi);

   	if ($count >= 50) {
   		$filesToDelete = $count - 50;
   		$index = 0;
		if ($handle = opendir($dir)) {
			while (($file = readdir($handle)) !== false){
				if (!in_array($file, array('.', '..')) && !is_dir($dir.$file)) {
					unlink($dir.$file);
					$index++;
					if($index >= $filesToDelete) break;
				}
			}
		}
   	}
}

if (!empty($_REQUEST['name'])){

	$imageData = file_get_contents("php://input");

	$new_data = explode(";",$imageData);
	$type = $new_data[0];
	$data = explode(",", $new_data[1]);

	$imageData = base64_decode($data[1]);

	$output_file = $dir . $_REQUEST['name'].'.png';
	$ifp = fopen($output_file, "wb");
    fwrite($ifp, $imageData);
    fclose($ifp);

	cleanup($dir);
}
?>