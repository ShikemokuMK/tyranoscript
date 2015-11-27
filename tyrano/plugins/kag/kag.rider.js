
//ティラノライダー用のクラス
//デバッグツール向けの処理が集中します。

tyrano.plugin.kag.rider ={

    app:{}, //ライダー側のルート
    tyrano:null,
    rider_view:{},
    
    init:function(){
         //alert("init rider");
    },
    
    complete:function(TG){
        //ゲームがスタートした時にライダー側に通知する
        //alert("complete!");
        //riderからの起動かどうかを判定する必要あり
        if(window.opener.app){
            TYRANO.kag.is_rider = true;
            this.app = window.opener.app;
            this.app.completeRider(TG);
            
        }
    },
    
    cutTyranoTag:function(tag,pm){
        
        TYRANO.kag.ftag.startTag(tag,pm);
    
    },
    
    cutTyranoScript:function(str){
        
        var result = TYRANO.kag.parser.parseScenario(str);
        
        var array_s = result.array_s;
        for(var i=0;i<array_s.length;i++){
            var tag = array_s[i];
            this.app.rider_view.pushConsoleGrid("tag",tag);
            this.cutTyranoTag(tag.name,tag.pm);
        }
        
    },
    
    //シナリオのラベル一覧を取得する 
    getScenario:function(scenario_name,call_back){
        
        var that = this;
        
        var file_url = "./data/scenario/"+scenario_name;
        
        $.loadText(file_url,function(text_str){
            
            var result_obj = TYRANO.kag.parser.parseScenario(text_str);
            
            if(call_back){
                call_back(result_obj);
            }
            
        });
        //ラベルの一覧を取得
        
        //呼び出し元（riderの関数呼び出し方法）
        //window.opener.myFunc();
        
    },
    
    //変数を取得する
    getVariables:function(){
        var map_variable = TYRANO.kag.variable;
        
        var f = TYRANO.kag.stat.f;
        var mp = TYRANO.kag.stat.mp;
        
        map_variable.f = f;
        map_variable.mp = mp;
        
        return map_variable;
    },
    
    //ライダー側で変数が編集された
    evalScript:function(str){
        TYRANO.kag.evalScript(str);
    },
    
    //変数値を更新します
    pushVariableGrid:function(){
        this.app.rider_view.initVariableGrid();
    },
    
    //命令が実行されて、デバッグツール側にコンソールを発信する
    pushConsoleLog:function(tag){
        console.log(tag);
        //タグをアプリ側にプッシュします
        this.app.rider_view.pushConsoleGrid("tag",tag);
    
    }
    
    
    
    
};


