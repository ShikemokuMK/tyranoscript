
[cm]

@clearstack
@bg storage ="title.png" time=100
@wait time = 200

*start 

[button x=166 y=304 graphic="title/button_start.gif" target="gamestart"]
[button x=166 y=408 graphic="title/button_cg.gif"  storage="cg.ks"]
[button x=166 y=507 graphic="title/button_config.gif" role="sleepgame" storage="config.ks"]
[button x=486 y=304 graphic="title/button_load.gif" role="load"]
[button x=486 y=408 graphic="title/button_replay.gif" storage="replay.ks"]

[s]

*gamestart
;一番最初のシナリオファイルへジャンプする
@jump storage="scene1.ks"



