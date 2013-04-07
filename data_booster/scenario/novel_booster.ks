;=============================
;ノベルブースターパック用の各種ライブラリ
;=============================

;CGモード、登録すべき画像ファイル一覧

[iscript]

    tf.flag_replay = false;

    /*CGモードで表示されるCG一覧を登録*/ 
        
        tf.cg_array = [
        
            "room.jpg",
            "rouka.jpg",
            "toile.jpg",
            "entrance.jpg",
            "room.jpg",
            "room.jpg",
            "room.jpg",
            "room.jpg",
            "room.jpg",
            "room.jpg",
            "room.jpg",
            "room.jpg",
            "room.jpg",
            "room.jpg"
            
            
        ];
 
 /*
 
 回想モードに登録される
 image =  回想モードで表示される画像を指定できます。
 storageとtarget = 回想の開始地点位置をファイルとラベルを指定します
 
 */ 
           
        tf.replay_array = [
        
            {image:"cat.jpg",storage:"event.ks",target:"replay_scene1"},
            {image:"entrance.jpg",storage:"scenario1.ks",target:"replay_scene2"},
            {image:"rouka.jpg",storage:"scenario1.ks",target:"replay_scene3"},
            {image:"toile.jpg",storage:"scenario1.ks",target:"replay_scenetmp"},
            {image:"room.jpg",storage:"scenario1.ks",target:"replay_scenet"},
            {image:"room.jpg",storage:"scenario1.ks",target:"replay_scenet"},
            {image:"room.jpg",storage:"scenario1.ks",target:"replay_scenet"},
            {image:"room.jpg",storage:"scenario1.ks",target:"replay_scenet"},
            {image:"room.jpg",storage:"scenario1.ks",target:"replay_scenet"},
            {image:"room.jpg",storage:"scenario1.ks",target:"replay_scenet"},
            {image:"room.jpg",storage:"scenario1.ks",target:"replay_scenet"},
            {image:"room.jpg",storage:"scenario1.ks",target:"replay_scenet"}
            
        ];
        
        if(sf.cg_viewd){
        }else{
            sf.cg_viewd = {};
        }

        if(sf.replay_viewd){
        }else{
            sf.replay_viewd = {};
        }
        
        
[endscript]

;CGが閲覧された場合、CGモードで表示できるようにする
[macro name="cg" ]

    [iscript]

        sf.cg_viewd[mp.storage] = "on";
    
    [endscript]

[endmacro]

;回想モード終了。回想モードからのアクセスの場合、回想画面に戻る

[macro name="endreplay"]

    [if exp="tf.flag_replay == true"]
        
        @layopt page="fore" layer="message0" visible=false
        ;システムボタンを非表示にするなど
        [hidemenubutton]
        
        @jump storage="replay.ks" 
        
    [endif]



[endmacro]

[macro name="setreplay"]

    [iscript]
        sf.replay_viewd[mp.name] = "on";
    [endscript]

[endmacro]

