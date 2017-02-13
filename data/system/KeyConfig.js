
/*
 
<キーボード> 
    save 
    load 
    next
    menu
    title
    menu
    skip
    backlog
    fullscreen
    qsave
    qload
    auto
    config
    sleepgame
    
*/

var __tyrano_key_config = {

    //キーボード操作
    "key" : {
    
        "32" : "hidemessage", //右クリックの動作
        "27" : "hidemessage",
        "13" : "next",
        "65" : "next",
        "91" : "skip",
        "9" : "auto",
        "83" : "save",
        "76" : "load",
        "67":function(){
            //config呼び出し
            TYRANO.kag.ftag.startTag("sleepgame", {storage:"../others/plugin/theme_tyrano_02/config.ks"});
        }
        
    },

    //マウス操作
    "mouse" : {
        "right" : "hidemessage", //右クリックの動作
        "center": "menu",
        "wheel_up" : "backlog",
        "wheel_down" : "next"
    },

    //ジェスチャー
    "gesture" : {
        "swipe_up" : {
            "finger" : 1,
            "action" : "backlog"
        },
        "swipe_left" : {
            "finger" : 1,
            "action" : "hidemessage"
        },
        "swipe_right" : {
            "finger" : 1,
            "action" : "skip"
        },
        "swipe_down" : {
            "finger" : 1,
            "action" : "save"
        },
        
        "hold" : {
            "action" : "skip",
            "time" : 3000
        }
    }

}; 