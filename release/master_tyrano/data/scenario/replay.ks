;=========================================
; 回想モード　画面作成
;=========================================
*start

[cm]

[back storage="cgbg.png"]
[layopt layer=1 visible=true]
[ptext layer=1 page=fore text="回想モード" x=20 y=20 size=26 color=white visible=true]

[iscript]
    
    tf.page = 0;
    tf.selected_replay_obj = ""; //選択されたリプレイを一時的に保管
    
[endscript]



*replaypage
[cm]
[button graphic="back_title.gif" target="*backtitle" x=800 y=20 ]

[iscript]
	tf.target_page = "page_"+tf.page;
[endscript]

*replayview

*cgview
@jump target=&tf.target_page

*page_0
[replay_image_button name="replay1" graphic="cat.jpg" x=60 y=50 width=160 height=140 folder="bgimage" ]
[replay_image_button name="replay2" graphic="toile.jpg" x=260 y=50 width=160 height=140 folder="bgimage" ]

[button target="*nextpage" graphic=nextpage.gif x=800 y=600  ]

@jump target ="*common"

*page_1
[replay_image_button name="replay1" graphic="cat.jpg" x=60 y=50 width=160 height=140 folder="bgimage" ]
[replay_image_button name="replay2" graphic="toile.jpg" x=260 y=50 width=160 height=140 folder="bgimage" ]

[button target="*backpage" graphic=backpage.gif x=640 y=600  ]


@jump target ="*common"

*common

[s]

*backtitle
[cm]
[freeimage layer=1]
@jump storage=title.ks

*nextpage
[emb exp="tf.page++;"]
@jump target="*replaypage"


*backpage
[emb exp="tf.page--;"]
@jump target="*replaypage"

*clickcg
[cm]

[iscript]
    tf.flag_replay = true;
	
[endscript]


@jump storage=&tf.selected_replay_obj.storage target=&tf.selected_replay_obj.target
[s]

*no_image

@jump  target=*replaypage


