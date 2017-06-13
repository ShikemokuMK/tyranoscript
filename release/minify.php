<?php 

echo "start TyranoScript Minifiy\n";

echo "version:v".$argv[1]."\n";

$version = $argv[1];

//今日の日付を含むディレクトリの作成
$tyrano_name = "tyranoscript_v".$version;
$dirname="./result/".$tyrano_name;

mkdir($dirname, 0700);

//original_dataのコピー

$original_dir = "../tyrano/";

//通常コピーで良いファイル郡
$array_copy = array(

//"jquery-1.10.2.min.js",
//"jquery-ui-1.8.20.custom.min.js",
//"jquery.a3d.min.js",
"libs.js",
"tyrano.base.js",
"tyrano.js",
"tyrano.css",
"animate.css",
"font.css",
"lang.js",

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
"plugins/kag/kag.rider.js",
"plugins/kag/kag.tag_camera.js",



);

//トップディレクトリ
exec("cp ../index.html ".$dirname."/index.html");
exec("cp ../readme.txt ".$dirname."/readme.txt");
//exec("cp ../memo.txt ".$dirname."/うまく動かない場合.txt");
//exec("cp ../package.json ".$dirname."/package.json");


exec("mkdir -p -m 777 ".$dirname."/tyrano/plugins/kag/");


foreach($array_copy as $file){

	//echo "cp --parents ../tyrano/".$file." ".$dirname."/tyrano/";
	//コピーする
	exec("cp ../tyrano/".$file." ".$dirname."/tyrano/");

}

//ライブラリディレクのコピー
	exec("cp -R ../tyrano/libs ".$dirname."/tyrano/");

//imageディレクトリのコピー
	exec("cp -R ../tyrano/images ".$dirname."/tyrano/");
	exec("cp -R ../tyrano/html ".$dirname."/tyrano/");

//オリジナルマスターデータのコピー	
	exec("cp -R ./master_tyrano/data ".$dirname."/data");
	
//ミニファイ対象のコピー
foreach($array_mini as $file){

	//echo "cp --parents ../tyrano/".$file." ".$dirname."/tyrano/";
	//コピーする
	//exec("cp ../tyrano/".$file." ".$dirname."/tyrano/");
	exec("java -jar compiler-latest/compiler.jar --js=../tyrano/".$file." --js_output_file=".$dirname."/tyrano/".$file." --compilation_level WHITESPACE_ONLY");
	

}

	chdir("./result") ;

	exec("zip -r ".$tyrano_name.".zip ".$tyrano_name );
	
	//$mac_path = "tyranoscript_for_mac_v".$version;
	//$win_path = "tyranoscript_for_win_v".$version;
	
//各ファイルをコピーする	
	//exec("cp -R ../binmac ".$mac_path);
	//exec("cp -R ../binwin ".$win_path);
	
	//exec("cp -R ".$dirname."/* ".$mac_path."/");
	//exec("cp -R ".$dirname."/* ".$win_path."/");
	
	//exec("zip -r ".$mac_path.".zip ".$mac_path."/*" );
	//exec("zip -r ".$win_path.".zip ".$win_path."/*" );
	

//copy("", $newfile);


//必要なファイルをコピーする

//JSなど一部のファイルはミニファイする


echo "finish minify tyrano";


