<?php 

echo "start TyranoScript Minifiy\n";

//今日の日付を含むディレクトリの作成
$dirname="./result/tyrano_".date("Ymd_g_i_s");

mkdir($dirname, 0700);

//original_dataのコピー

$original_dir = "../tyrano/";

//通常コピーで良いファイル郡
$array_copy = array(

"jquery-1.10.2.min.js",
"jquery-ui-1.8.20.custom.min.js",
"jquery.a3d.min.js",
"libs.js",
"tyrano.base.js",
"tyrano.js",
"tyrano.css",
"flash.js",
"lang.js",
"jsrender.min.js",
"html2canvas.js",

);

//ミニファイ対象のファイル郡

$array_mini = array(

"plugins/kag/kag.js",
"plugins/kag/kag.layer.js",
"plugins/kag/kag.menu.js",
"plugins/kag/kag.event.js",
"plugins/kag/kag.parser.js",
"plugins/kag/kag.tag.js",
"plugins/kag/kag.tag_audio.js",
"plugins/kag/kag.tag_ext.js",
"plugins/kag/kag.tag_system.js",
"plugins/kag/kag.key_mouse.js",

);

//トップディレクトリ
exec("cp ../index.html ".$dirname."/index.html");
exec("cp ../readme.txt ".$dirname."/readme.txt");
exec("cp ../novel_sound.swf ".$dirname."/novel_sound.swf");
//exec("cp ../memo.txt ".$dirname."/うまく動かない場合.txt");
exec("cp ../package.json ".$dirname."/package.json");


exec("mkdir -p -m 777 ".$dirname."/tyrano/plugins/kag/");


foreach($array_copy as $file){

	//echo "cp --parents ../tyrano/".$file." ".$dirname."/tyrano/";
	//コピーする
	exec("cp ../tyrano/".$file." ".$dirname."/tyrano/");

}


//imageディレクトリのコピー
	exec("cp -R ../tyrano/images/ ".$dirname."/tyrano/");
	exec("cp -R ../tyrano/html/ ".$dirname."/tyrano/");

//オリジナルマスターデータのコピー	
	exec("cp -R ./master_tyrano/data ".$dirname."/data/");
	
//ミニファイ対象のコピー
foreach($array_mini as $file){

	//echo "cp --parents ../tyrano/".$file." ".$dirname."/tyrano/";
	//コピーする
	//exec("cp ../tyrano/".$file." ".$dirname."/tyrano/");
	exec("java -jar compiler-latest/compiler.jar --js=../tyrano/".$file." --js_output_file=".$dirname."/tyrano/".$file." --compilation_level WHITESPACE_ONLY");
	

}



//copy("", $newfile);


//必要なファイルをコピーする

//JSなど一部のファイルはミニファイする


echo "finish minify tyrano";


