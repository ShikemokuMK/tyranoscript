;=========================================
; コンフィグ モード　画面作成
;=========================================
@layopt layer=message0 visible=false
@clearfix

[hidemenubutton]

[iscript]
	tf.current_bgm_vol = parseInt(TG.config.defaultBgmVolume);
	tf.current_se_vol = parseInt(TG.config.defaultSeVolume);
	
	tf.current_ch_speed = parseInt(TG.config.chSpeed);
	tf.current_auto_speed = parseInt(TG.config.autoSpeed);
	
	tf.text_skip ="ON";
	
	if(TG.config.unReadTextSkip != true){
		tf.text_skip ="OFF";
	} 
	
[endscript]

[layopt layer=1 visible=true]

[cm]
[bg time=300 storage="cgbg.png"]
[ptext layer=1 page=fore text="Game Config" x=20 y=20 size=32 color=0xA8401C visible=true]
[button graphic="back_title.gif" target="*backtitle" x=730 y=20 ]
@jump target="*config_page"

*config_page

;BGM音量
[ptext layer=1 page=fore text="BGM 音量：" x=40 y=145 size=26 color=black visible=true]
[ptext name="text_bgm_vol" layer=1 page=fore text="&tf.current_bgm_vol" x=190 y=150 size=26 color=black visible=true]
[button fix="true" target="*vol_bgm_up" graphic=config/arrow_up.gif width=35 height=35 x=300 y=150  ]
[button fix="true" target="*vol_bgm_down" graphic=config/arrow_down.gif width=35 height=35 x=340 y=150  ]

;SE音量
[ptext layer=1 page=fore text="SE 音量：" x=40 y=195 size=26 color=black visible=true]
[ptext name="text_se_vol" layer=1 page=fore text="&tf.current_se_vol" x=190 y=200 size=26 color=black visible=true]
[button fix="true" target="*vol_se_up" graphic=config/arrow_up.gif width=35 height=35 x=300 y=200  ]
[button fix="true" target="*vol_se_down" graphic=config/arrow_down.gif width=35 height=35 x=340 y=200  ]

;メッセージスピード
[ptext layer=1 page=fore text="文字速度：" x=40 y=270 size=26 color=black visible=true]
[ptext layer=1 page=fore text="おそい" x=300 y=270 size=16 color=black visible=true]
[ptext layer=1 page=fore text="はやい" x=710 y=270 size=16 color=black visible=true]

[button name="ch,ch_100" fix="true" target="*ch_speed_change" exp="tf.set_ch_speed=100" graphic=config/01.gif width=35 height=35 x=360 y=270  ]
[button name="ch,ch_80" fix="true" target="*ch_speed_change" exp="tf.set_ch_speed=80" graphic=config/02.gif width=35 height=35 x=390 y=270  ]
[button name="ch,ch_50" fix="true" target="*ch_speed_change" exp="tf.set_ch_speed=50" graphic=config/03.gif width=35 height=35 x=420 y=270  ]
[button name="ch,ch_40" fix="true" target="*ch_speed_change" exp="tf.set_ch_speed=40" graphic=config/04.gif width=35 height=35 x=450 y=270  ]
[button name="ch,ch_30" fix="true" target="*ch_speed_change" exp="tf.set_ch_speed=30" graphic=config/05.gif width=35 height=35 x=480 y=270  ]
[button name="ch,ch_25" fix="true" target="*ch_speed_change" exp="tf.set_ch_speed=25" graphic=config/06.gif width=35 height=35 x=510 y=270  ]
[button name="ch,ch_20" fix="true" target="*ch_speed_change" exp="tf.set_ch_speed=20" graphic=config/07.gif width=35 height=35 x=540 y=270  ]
[button name="ch,ch_11" fix="true" target="*ch_speed_change" exp="tf.set_ch_speed=11" graphic=config/08.gif width=35 height=35 x=570 y=270  ]
[button name="ch,ch_8" fix="true" target="*ch_speed_change" exp="tf.set_ch_speed=8" graphic=config/09.gif width=35 height=35 x=600 y=270  ]
[button name="ch,ch_5" fix="true" target="*ch_speed_change" exp="tf.set_ch_speed=5" graphic=config/10.gif width=35 height=35 x=630 y=270  ]


;オート速度
[ptext layer=1 page=fore text="オート速度：" x=40 y=330 size=26 color=black visible=true]
[ptext layer=1 page=fore text="おそい" x=300 y=330 size=16 color=black visible=true]
[ptext layer=1 page=fore text="はやい" x=710 y=330 size=16 color=black visible=true]

[button fix="true" name="auto,auto_5000" target="*auto_speed_change" exp="tf.set_auto_speed=5000;tf.text_auto=0" graphic=config/01.gif width=35 height=35 x=360 y=330  ]
[button fix="true" name="auto,auto_4500" target="*auto_speed_change" exp="tf.set_auto_speed=4500;tf.text_auto=1" graphic=config/02.gif width=35 height=35 x=390 y=330  ]
[button fix="true" name="auto,auto_4000" target="*auto_speed_change" exp="tf.set_auto_speed=4000;tf.text_auto=2" graphic=config/03.gif width=35 height=35 x=420 y=330  ]
[button fix="true" name="auto,auto_3500" target="*auto_speed_change" exp="tf.set_auto_speed=3500;tf.text_auto=3" graphic=config/04.gif width=35 height=35 x=450 y=330  ]
[button fix="true" name="auto,auto_3000" target="*auto_speed_change" exp="tf.set_auto_speed=3000;tf.text_auto=4" graphic=config/05.gif width=35 height=35 x=480 y=330  ]
[button fix="true" name="auto,auto_2500" target="*auto_speed_change" exp="tf.set_auto_speed=2500;tf.text_auto=5" graphic=config/06.gif width=35 height=35 x=510 y=330  ]
[button fix="true" name="auto,auto_2000" target="*auto_speed_change" exp="tf.set_auto_speed=2000;tf.text_auto=6" graphic=config/07.gif width=35 height=35 x=540 y=330  ]
[button fix="true" name="auto,auto_1000" target="*auto_speed_change" exp="tf.set_auto_speed=1000;tf.text_auto=7" graphic=config/08.gif width=35 height=35 x=570 y=330  ]
[button fix="true" name="auto,auto_800" target="*auto_speed_change" exp="tf.set_auto_speed=800;tf.text_auto=8" graphic=config/09.gif width=35 height=35 x=600 y=330  ]
[button fix="true" name="auto,auto_500" target="*auto_speed_change" exp="tf.set_auto_speed=500;tf.text_auto=9" graphic=config/10.gif width=35 height=35 x=630 y=330  ]

[iscript]
$(".ch_"+tf.current_ch_speed).css("top",260);
$(".auto_"+tf.current_auto_speed).css("top",320);

[endscript]


;未読スキップ
[ptext layer=1 page=fore text="未読スキップ：" x=40 y=400 size=26 color=black visible=true]
[ptext name="text_skip" layer=1 page=fore text="&tf.text_skip" x=230 y=405 size=26 color=black visible=true]
[button fix="true" target="*skip_off" graphic=config/off.gif width=85  x=340 y=405  ]
[button fix="true" target="*skip_on" graphic=config/on.gif width=85  x=440 y=405  ]


@jump target="*common"

*page_2

@jump target="*common"

*common


*endpage

[s]

*backtitle
[cm]
[freeimage layer=1]
@clearfix

@jump storage=title.ks

*nextpage
[freeimage layer=1]
[cm]
@jump storage="first.ks" target="*start"


*backpage
[emb exp="tf.page--;"]
@jump target="*cgpage"

*clickcg

[return]

*no_image

;@jump  target=*cgpage

*vol_bgm_down

[iscript]
if(tf.current_bgm_vol != 0){
	tf.current_bgm_vol -= 10;	
	$(".text_bgm_vol").html(tf.current_bgm_vol);
}
[endscript]

[bgmopt volume="&tf.current_bgm_vol"]

[return]

*vol_bgm_up
[iscript]
if(tf.current_bgm_vol != 100){
	tf.current_bgm_vol += 10;	
	$(".text_bgm_vol").html(tf.current_bgm_vol);
}
[endscript]
[bgmopt volume="&tf.current_bgm_vol"]

[return]

*vol_se_down

[iscript]
if(tf.current_se_vol != 0){
	tf.current_se_vol -= 10;	
	$(".text_se_vol").html(tf.current_se_vol);
}
[endscript]

[seopt volume="&tf.current_se_vol"]

[return]

*vol_se_up
[iscript]
if(tf.current_se_vol != 100){
	tf.current_se_vol += 10;	
	$(".text_se_vol").html(tf.current_se_vol);
}
[endscript]
[seopt volume="&tf.current_se_vol"]

[return]


*ch_speed_change
[iscript]
$(".ch").css("top",270);
$(".ch_"+tf.set_ch_speed).css("top",260);
[endscript]
[configdelay speed="&tf.set_ch_speed"]

;テキストスピード表示
[position layer="message0" left=10 top=520 width=940 height=220 page=fore visible=true]
@layopt layer=message0 visible=true
テキスト速度テスト
[wait time=2000]
[er]
@layopt layer=message0 visible=false

[return]


*auto_speed_change

[iscript]

$(".auto").css("top",330);
$(".auto_"+tf.set_auto_speed).css("top",320);

[endscript]
[autoconfig speed="&tf.set_auto_speed"]

[return]

*skip_off
[iscript]
	tf.text_skip = "OFF";
	$(".text_skip").html("OFF");
[endscript]
[config_record_label skip=false]
[return]

*skip_on
[iscript]
	tf.text_skip = "ON";
	$(".text_skip").html("ON");
[endscript]
[config_record_label skip=true]
[return]


