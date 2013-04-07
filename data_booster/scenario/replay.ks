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
    tf.cg_index = 0; 
    
    tf.replay_length = tf.replay_array.length;
    
    tf.selected_replay_obj = ""; //選択されたリプレイを一時的に保管
    
    
[endscript]



*replaypage
[cm]
[button graphic="back_title.gif" target="*backtitle" x=800 y=20 ]

[iscript]
    tf.tmp_index = 0;
    tf.cg_index = 12 * tf.page;
    tf.top = 100;
    tf.left = 60;
    
[endscript]

*replayview

[if exp ="sf.replay_viewd[tf.replay_array[tf.cg_index].target]" ]

    [button graphic=&tf.replay_array[tf.cg_index].image x=&tf.left y=&tf.top width=160 height=140 exp="tf.selected_replay_obj = tf.replay_array[preexp]" target="*clickcg" folder="bgimage" preexp="tf.cg_index" ]
    
[else]

    [button graphic=noise.jpg x=&tf.left y=&tf.top width=160 height=140 folder="bgimage" target="*no_image"]
    
[endif]

[iscript]

    tf.tmp_index++;
    tf.cg_index++;
    tf.left += 160 + 60;

[endscript]

;1ページに12 枚

[if exp=" tf.tmp_index == 12 || tf.cg_index >= tf.cg_length"]
    @jump target="*endpage"
[endif]

[if exp="tf.tmp_index % 4 == 0 "]
    [iscript]
        tf.top += 140 + 30;
        tf.left = 60;
    [endscript]
[endif]

@jump target="*replayview"

*endpage

[if exp="tf.page !=0"]
    
    [button target="*backpage" graphic=backpage.gif x=640 y=600  ]
            
[endif]

[if exp="tf.cg_length > tf.cg_index"]

    [button target="*nextpage" graphic=nextpage.gif x=800 y=600  ]

[endif]


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



