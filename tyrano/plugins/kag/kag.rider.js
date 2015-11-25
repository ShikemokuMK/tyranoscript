
//ティラノライダー用のクラス
//デバッグツール向けの処理が集中します。

tyrano.plugin.kag.rider ={

    tyrano:null,
    
    init:function(){
         //alert("init rider");
    },
    
    complete:function(TG){
        //ゲームがスタートした時にライダー側に通知する
        //alert("complete!");
        //riderからの起動かどうかを判定する必要あり
        window.opener.app.completeRider(TG);
    },
    
    cutTyranoTag:function(tag,pm){
        TYRANO.kag.ftag.startTag(tag,pm);
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
        
    }
};


