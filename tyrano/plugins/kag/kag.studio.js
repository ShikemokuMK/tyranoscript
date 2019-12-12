//ティラノスタジオ用のクラス
//デバッグツール向けの処理が集中します。

tyrano.plugin.kag.studio = {

    app : {}, //ライダー側のルート
    tyrano : null,
    rider_view : {},
    ipc:{},
    
    map_watch:{},
    
    init : function() {
        //alert("init rider");
        
        if(window.navigator.userAgent.indexOf("TyranoStudio") !=-1){
            
            TYRANO.kag.is_studio = true;
            
            this.ipc = require('electron');
            
            this.ipc.ipcRenderer.on('ping', (event, arg) => {
                //console.log("wwwwwwwwwwwwwww");
                //console.log(arg);
                this.send('asynchronous-reply', JSON.stringify(arg));
            });
            
            this.ipc.ipcRenderer.on('variable-add', (event, arg) => {
                
                let data = JSON.parse(arg);
                let array_name = data["names"];
                
                for(let i=0;i<array_name.length;i++){
                    
                    let name = array_name[i]["name"];
                    
                    let val = "" + this.kag.embScript(name);
                    
                    this.map_watch[name] = val;
                    
                    array_name[i]["val"] = val; 
                    
                }
                
                data["names"] = array_name;
                    
                this.send('changed-variable', data);
            
            });
            
            //セーブデータの消去
            this.ipc.ipcRenderer.on('status-clear-save-data', (event, arg) => {
                
                localStorage.clear();
                
            });
            
            this.ipc.ipcRenderer.on("status-load-save",(event,arg)=>{
                
                let data = JSON.parse(arg);
                let slot = data["slot"];
                
                var timer_id = setInterval(()=>{
                    //strongstop 担った瞬間にロードする
                    if(this.kag.stat.is_strong_stop==true){
                        clearInterval(timer_id);　
                        this.kag.menu.loadGame(slot);
                    }
                
                }, 100);
            
            });
            
            //初期化
            this.send('init-variable', {});
            
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
    
    
    notifyChangeVariable:function(){
        
        let data = {};
        let array_name = [];
        
        for(let key in this.map_watch){
            
            let val = this.kag.embScript(key);
            this.map_watch[key] = val;
            
            array_name.push({"name":key,"val":val});
            
        }
        
        data["names"] = array_name;
        
        this.send("changed-variable",data);
        
    },
    
    pushConsole:function(obj){
        
        this.send("replay-console",obj);
        
    },
    

    complete : function(TG) {
        
        console.log(TG);
        let array_save = TG.kag.menu.getSaveData();
        
        console.log(array_save);
        
        let init_data = {
            "array_save":array_save
        };
        
        this.send("load-complete",init_data);
    
    },

    
    
};

