;=========================================
; CG モード　画面作成
;=========================================

[cm]



[back storage="cgbg.png"]
[layopt layer=1 visible=true]
[ptext layer=1 page=fore text="CGモード" x=20 y=20 size=26 color=white visible=true]


[iscript]
    
    tf.page = 0;
    tf.cg_index = 0; 
    
    tf.cg_length = tf.cg_array.length;
    
    tf.selected_cg_image = ""; //選択されたCGを一時的に保管
    
[endscript]



*cgpage
[cm]
[button graphic="back_title.gif" target="*backtitle" x=800 y=20 ]

[iscript]
    tf.tmp_index = 0;
    tf.cg_index = 12 * tf.page;
    tf.top = 100;
    tf.left = 60;
    
[endscript]

*cgview

[if exp ="sf.cg_viewd[tf.cg_array[tf.cg_index]]" ]

    [button graphic=&tf.cg_array[tf.cg_index] x=&tf.left y=&tf.top width=160 height=140 exp="tf.selected_cg_image = tf.cg_array[preexp]" target="*clickcg" folder="bgimage" preexp="tf.cg_index" ]
    
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

@jump target="*cgview"

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
@jump target="*cgpage"


*backpage
[emb exp="tf.page--;"]
@jump target="*cgpage"

*clickcg
[cm]
[image storage=&tf.selected_cg_image folder="bgimage"  ]
[l]
[back storage="cgbg.png" time=10]
@jump  target=*cgpage
[s]

*no_image

@jump  target=*cgpage



