//ティラノスタジオ用のクラス
//デバッグツール向けの処理が集中します。

tyrano.plugin.kag.studio = {

    app : {}, //ライダー側のルート
    tyrano : null,
    rider_view : {},
    ipc:{},
    init : function() {
        //alert("init rider");
        
        if(window.navigator.userAgent.indexOf("TyranoStudio") !=-1){
            
            TYRANO.kag.is_studio = true;
            
            this.ipc = require('electron');
            
            this.ipc.ipcRenderer.on('ping', (event, arg) => {
                console.log("wwwwwwwwwwwwwww");
                console.log(arg);
                ipc.ipcRenderer.send('asynchronous-reply', JSON.stringify(arg));
            });
        
        }
        
        //ユーザーエージェントに TyranoStudio があるかどうかで判定する
        /*
        ipcRenderer.on('ping', (event, arg) => {
            console.log(arg) // pong
        })
        */
        
    
    },
    
    send:function(key,json_obj){
        
        this.ipc.ipcRenderer.send(key, JSON.stringify(json_obj));
        
    },
    
    pushConsole:function(obj){
        
        this.send("replay-console",obj);
        
    },

    complete : function(TG) {
        
    },

    
    
};

