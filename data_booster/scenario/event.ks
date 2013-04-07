
;イベントシーンサンプル

;回想モード記録用のラベル名
*replay_scene1 

@layopt layer="message0" visible=true

[setreplay name="replay_scene1"]

[layopt layer=3 visible=true ]
[image storage="cat.jpg" layer=3 width=960 height=640 folder="bgimage" ]

ここは、回想モードで記録されているよ。[p]
まだまだ[p]
もういいかな？[p]
じゃ、回想記録終わるね[p]

[freeimage layer=3]

;回想記録終了 
[endreplay] 
