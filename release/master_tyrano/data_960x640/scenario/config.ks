; ティラノスクリプト標準テーマプラグイン

;=========================================
; コンフィグ モード　画面作成
;=========================================

;	メッセージレイヤ０を不可視に
	[layopt layer=message0 visible=false]
;	fixボタン消し
	[clearfix]
	
;ゲーム中に効果が設定されている場合は無効
[free_layermode time=0 ]
[reset_camera time=0]
	
;　イメージ消去

[iscript]
$(".layer_camera").empty();
[endscript]

;	メニューボタン非表示
	[hidemenubutton]

[iscript]

	tf.current_bgm_vol=parseInt(TG.config.defaultBgmVolume);
	tf.current_se_vol=parseInt(TG.config.defaultSeVolume);
	
	tf.current_ch_speed=parseInt(TG.config.chSpeed);
	tf.current_auto_speed=parseInt(TG.config.autoSpeed);
	
	tf.text_skip ="ON";
	
	if(TG.config.unReadTextSkip != "true"){
		tf.text_skip ="OFF";
	} 

[endscript]

;	レイヤ1を可視に
	[layopt layer=1 visible=true]

[cm]

;	コンフィグ用の背景を読み込んでトランジション
	[bg storage="../../tyrano/images/system/bg_config.jpg" time=100]

;	画面右上の「Back」ボタン
	[button graphic="config/c_btn_back.png" fix=true enterimg="config/c_btn_back2.png" target="*backtitle" x=840 y=20]

[jump target="*config_page"]

*config_page

;かなり横長なスクリプトになってしまったのでマクロにしたほうがスッキリします
;c_btn.png は 4×4px の完全透明な画像です。width.heightを使って拡大しています
;一部のスマホブラウザでは音量変更に対応していないのでご留意ください

;------------------------------------------------------------------------------------------------------
;▼BGM音量
;------------------------------------------------------------------------------------------------------
;BGM音量-1０
[button name="bgmvol,bgmvol_10"  fix="true" target="*vol_bgm_change" graphic="config/c_btn.png" width=35 height=35 x=300 y=170 exp="tf.current_bgm_vol=10"]
;BGM音量-20
[button name="bgmvol,bgmvol_20"  fix="true" target="*vol_bgm_change" graphic="config/c_btn.png" width=35 height=35 x=340 y=170 exp="tf.current_bgm_vol=20"]
;BGM音量-30
[button name="bgmvol,bgmvol_30"  fix="true" target="*vol_bgm_change" graphic="config/c_btn.png" width=35 height=35 x=380 y=170 exp="tf.current_bgm_vol=30"]
;BGM音量-40
[button name="bgmvol,bgmvol_40"  fix="true" target="*vol_bgm_change" graphic="config/c_btn.png" width=35 height=35 x=420 y=170 exp="tf.current_bgm_vol=40"]
;BGM音量-50
[button name="bgmvol,bgmvol_50"  fix="true" target="*vol_bgm_change" graphic="config/c_btn.png" width=35 height=35 x=460 y=170 exp="tf.current_bgm_vol=50"]
;BGM音量-60
[button name="bgmvol,bgmvol_60"  fix="true" target="*vol_bgm_change" graphic="config/c_btn.png" width=35 height=35 x=500 y=170 exp="tf.current_bgm_vol=60"]
;BGM音量-70
[button name="bgmvol,bgmvol_70"  fix="true" target="*vol_bgm_change" graphic="config/c_btn.png" width=35 height=35 x=540 y=170 exp="tf.current_bgm_vol=70"]
;BGM音量-80
[button name="bgmvol,bgmvol_80"  fix="true" target="*vol_bgm_change" graphic="config/c_btn.png" width=35 height=35 x=580 y=170 exp="tf.current_bgm_vol=80"]
;BGM音量-90
[button name="bgmvol,bgmvol_90"  fix="true" target="*vol_bgm_change" graphic="config/c_btn.png" width=35 height=35 x=620 y=170 exp="tf.current_bgm_vol=90"]
;BGM音量-100
[button name="bgmvol,bgmvol_100" fix="true" target="*vol_bgm_change" graphic="config/c_btn.png" width=35 height=35 x=660 y=170 exp="tf.current_bgm_vol=100"]

;BGM音量-ミュート（音量=0）
[button name="bgmvol,bgmvol_0"    fix="true" target="*vol_bgm_change" graphic="config/c_btn.png" width=35 height=35 x=780 y=170 exp="tf.current_bgm_vol=0"]


;------------------------------------------------------------------------------------------------------
;▼SE音量
;------------------------------------------------------------------------------------------------------
[button name="sevol,sevol_10"   fix="true" target="*vol_se_change" graphic="config/c_btn.png" width=35 height=35 x=300 y=220 exp="tf.current_se_vol=10"]
[button name="sevol,sevol_20"   fix="true" target="*vol_se_change" graphic="config/c_btn.png" width=35 height=35 x=340 y=220 exp="tf.current_se_vol=20"]
[button name="sevol,sevol_30"   fix="true" target="*vol_se_change" graphic="config/c_btn.png" width=35 height=35 x=380 y=220 exp="tf.current_se_vol=30"]
[button name="sevol,sevol_40"   fix="true" target="*vol_se_change" graphic="config/c_btn.png" width=35 height=35 x=420 y=220 exp="tf.current_se_vol=40"]
[button name="sevol,sevol_50"   fix="true" target="*vol_se_change" graphic="config/c_btn.png" width=35 height=35 x=460 y=220 exp="tf.current_se_vol=50"]
[button name="sevol,sevol_60"   fix="true" target="*vol_se_change" graphic="config/c_btn.png" width=35 height=35 x=500 y=220 exp="tf.current_se_vol=60"]
[button name="sevol,sevol_70"   fix="true" target="*vol_se_change" graphic="config/c_btn.png" width=35 height=35 x=540 y=220 exp="tf.current_se_vol=70"]
[button name="sevol,sevol_80"   fix="true" target="*vol_se_change" graphic="config/c_btn.png" width=35 height=35 x=580 y=220 exp="tf.current_se_vol=80"]
[button name="sevol,sevol_90"   fix="true" target="*vol_se_change" graphic="config/c_btn.png" width=35 height=35 x=620 y=220 exp="tf.current_se_vol=90"]
[button name="sevol,sevol_100" fix="true" target="*vol_se_change" graphic="config/c_btn.png" width=35 height=35 x=660 y=220 exp="tf.current_se_vol=100"]

;SEミュート
[button name="sevol,sevol_0"     fix="true" target="*vol_se_change" graphic="config/c_btn.png" width=35 height=35 x=780 y=220 exp="tf.current_se_vol=0"]

;------------------------------------------------------------------------------------------------------
;▼テキスト速度
;------------------------------------------------------------------------------------------------------
[button name="ch,ch_100" fix="true" target="*ch_speed_change" exp="tf.set_ch_speed=100" graphic="config/c_btn.png" width=35 height=35 x=300 y=290]
[button name="ch,ch_80" fix="true" target="*ch_speed_change" exp="tf.set_ch_speed=80"    graphic="config/c_btn.png" width=35 height=35 x=340 y=290]
[button name="ch,ch_50" fix="true" target="*ch_speed_change" exp="tf.set_ch_speed=50"    graphic="config/c_btn.png" width=35 height=35 x=380 y=290]
[button name="ch,ch_40" fix="true" target="*ch_speed_change" exp="tf.set_ch_speed=40"    graphic="config/c_btn.png" width=35 height=35 x=420 y=290]
[button name="ch,ch_30" fix="true" target="*ch_speed_change" exp="tf.set_ch_speed=30"    graphic="config/c_btn.png" width=35 height=35 x=460 y=290]
[button name="ch,ch_25" fix="true" target="*ch_speed_change" exp="tf.set_ch_speed=25"    graphic="config/c_btn.png" width=35 height=35 x=500 y=290]
[button name="ch,ch_20" fix="true" target="*ch_speed_change" exp="tf.set_ch_speed=20"    graphic="config/c_btn.png" width=35 height=35 x=540 y=290]
[button name="ch,ch_11" fix="true" target="*ch_speed_change" exp="tf.set_ch_speed=11"    graphic="config/c_btn.png" width=35 height=35 x=580 y=290]
[button name="ch,ch_8" fix="true" target="*ch_speed_change" exp="tf.set_ch_speed=8"       graphic="config/c_btn.png" width=35 height=35 x=620 y=290]
[button name="ch,ch_5" fix="true" target="*ch_speed_change" exp="tf.set_ch_speed=5"       graphic="config/c_btn.png" width=35 height=35 x=660 y=290]

;------------------------------------------------------------------------------------------------------
;▼オート速度
;------------------------------------------------------------------------------------------------------
[button fix="true" name="auto,auto_5000" target="*auto_speed_change" exp="tf.set_auto_speed=5000;tf.text_auto=0" graphic="config/c_btn.png" width=35 height=35 x=300 y=340]
[button fix="true" name="auto,auto_4500" target="*auto_speed_change" exp="tf.set_auto_speed=4500;tf.text_auto=1" graphic="config/c_btn.png" width=35 height=35 x=340 y=340]
[button fix="true" name="auto,auto_4000" target="*auto_speed_change" exp="tf.set_auto_speed=4000;tf.text_auto=2" graphic="config/c_btn.png" width=35 height=35 x=380 y=340]
[button fix="true" name="auto,auto_3500" target="*auto_speed_change" exp="tf.set_auto_speed=3500;tf.text_auto=3" graphic="config/c_btn.png" width=35 height=35 x=420 y=340]
[button fix="true" name="auto,auto_3000" target="*auto_speed_change" exp="tf.set_auto_speed=3000;tf.text_auto=4" graphic="config/c_btn.png" width=35 height=35 x=460 y=340]
[button fix="true" name="auto,auto_2500" target="*auto_speed_change" exp="tf.set_auto_speed=2500;tf.text_auto=5" graphic="config/c_btn.png" width=35 height=35 x=500 y=340]
[button fix="true" name="auto,auto_2000" target="*auto_speed_change" exp="tf.set_auto_speed=2000;tf.text_auto=6" graphic="config/c_btn.png" width=35 height=35 x=540 y=340]
[button fix="true" name="auto,auto_1300" target="*auto_speed_change" exp="tf.set_auto_speed=1300;tf.text_auto=7" graphic="config/c_btn.png" width=35 height=35 x=580 y=340]
[button fix="true" name="auto,auto_800"   target="*auto_speed_change" exp="tf.set_auto_speed=800;tf.text_auto=8"  graphic="config/c_btn.png" width=35 height=35 x=620 y=340]
[button fix="true" name="auto,auto_500"   target="*auto_speed_change" exp="tf.set_auto_speed=500;tf.text_auto=9"  graphic="config/c_btn.png" width=35 height=35 x=660 y=340]

;------------------------------------------------------------------------------------------------------
;▼未読スキップ
;------------------------------------------------------------------------------------------------------
; 未読スキップ-OFF
[button name="unread_off" fix="true" target="*skip_off" graphic="config/c_btn.png" width=125 height=35  x=300 y=420]
; 未読スキップ-ON
[button name="unread_on" fix="true" target="*skip_on" graphic="config/c_btn.png" width=125 height=35 x=435 y=420]

;------------------------------------------------------------------------------------------------------
;▼コンフィグ起動時の画面更新
;------------------------------------------------------------------------------------------------------
; BGM音量・SE音量・テキスト速度・オート速度・未読スキップの順
; $(セレクタ).attr("src","画像ファイルの場所");

;※画像差し替え版を使用するときは c_set.gif を c_set.png に書き換えてね

[iscript]
	$(".bgmvol_"+tf.current_bgm_vol).attr("src","data/image/config/c_set.png");

	$(".sevol_"+tf.current_se_vol).attr("src","data/image/config/c_set.png");

	$(".ch_"+tf.current_ch_speed).attr("src","data/image/config/c_set.png");

	$(".auto_"+tf.current_auto_speed).attr("src","data/image/config/c_set.png");

	if(tf.text_skip == 'OFF'){
		$(".unread_off").attr("src","data/image/config/c_uts_off.png");
		}else{
			$(".unread_on").attr("src","data/image/config/c_uts_on.png");
			}
[endscript]

[s]

;--------------------------------------------------------------------------------
; タイトルに戻る
;--------------------------------------------------------------------------------
*backtitle

[iscript]
tf.flag_back=$(".message1_fore").css("display");
[endscript]

[if exp="tf.flag_back=='none'"]

[cm]
[layopt layer=message1 visible=false]
[freeimage layer=1]
[clearfix]
;コンフィグの呼び出しに sleepgame を使っているので、必ず awakegame で戻してやってください
[awakegame]

[endif]

[return]


;===================================================

;★ボタンクリック時の処理

;===================================================
;--------------------------------------------------------------------------------
;▼BGM音量
;--------------------------------------------------------------------------------
*vol_bgm_change
[iscript]
	$(".bgmvol").attr("src","data/image/config/c_btn.png");
	$(".bgmvol_"+tf.current_bgm_vol).attr("src","data/image/config/c_set.png");
[endscript]
[bgmopt volume="&tf.current_bgm_vol"]
[return]

;--------------------------------------------------------------------------------
;▼SE音量
;--------------------------------------------------------------------------------
*vol_se_change
[iscript]
	$(".sevol").attr("src","data/image/config/c_btn.png");
	$(".sevol_"+tf.current_se_vol).attr("src","data/image/config/c_set.png");
[endscript]
[seopt volume="&tf.current_se_vol"]
[return]

;---------------------------------------------------------------------------------
;▼テキスト速度
;--------------------------------------------------------------------------------
*ch_speed_change
[iscript]
	$(".ch").attr("src","data/image/config/c_btn.png");
	$(".ch_"+tf.set_ch_speed).attr("src","data/image/config/c_set.png");
[endscript]
[configdelay speed="&tf.set_ch_speed"]

;	テキスト速度サンプル
	[position layer=message1 left=40 top=490 width=880 height=110 page=fore visible=true opacity=0]
	[layopt layer=message1 visible=true]
	[current layer=message1]
	[font color="0x454D51"]
	このスピードで表示されます

		[iscript]
		tf.system.backlog.pop(); // 上の「このスピードで表示されます」のテキストを履歴から削除
		[endscript]

	[wait time=2000]
	[er]
	[layopt layer=message1 visible=false]
	[return]

;--------------------------------------------------------------------------------
;▼オート速度
;--------------------------------------------------------------------------------
*auto_speed_change
[iscript]
	$(".auto").attr("src","data/image/config/c_btn.png");
	$(".auto_"+tf.set_auto_speed).attr("src","data/image/config/c_set.png");
[endscript]
[autoconfig speed="&tf.set_auto_speed"]
[return]

;--------------------------------------------------------------------------------
;▼スキップ処理-OFF
;--------------------------------------------------------------------------------
*skip_off
[iscript]
	$(".unread_off").attr("src","data/image/config/c_uts_off.png");
	$(".unread_on").attr("src","data/image/config/c_btn.png");
	tf.text_skip="OFF";
[endscript]
[config_record_label skip=false]
[return]

;--------------------------------------------------------------------------------
;▼スキップ処理-ON
;--------------------------------------------------------------------------------
*skip_on
[iscript]
	$(".unread_off").attr("src","data/image/config/c_btn.png");
	$(".unread_on").attr("src","data/image/config/c_uts_on.png");
	tf.text_skip="ON";
[endscript]
[config_record_label skip=true]
[return]

