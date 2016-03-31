//ティラノライダー用のクラス
//デバッグツール向けの処理が集中します。

tyrano.plugin.kag.rider = {

    app : {}, //ライダー側のルート
    tyrano : null,
    rider_view : {},

    init : function() {
        //alert("init rider");
    },

    complete : function(TG) {
        //ゲームがスタートした時にライダー側に通知する
        //alert("complete!");
        //riderからの起動かどうかを判定する必要あり
        if (window.opener && window.opener.app) {
            if(window.opener.app.config.user_config.check_debug==true){
                TYRANO.kag.is_rider = true;
                this.app = window.opener.app;
                this.app.completeRider(TG);
            }

        }
    },

    cutTyranoTag : function(tag, pm) {

        TYRANO.kag.ftag.startTag(tag, pm);

    },

    cutTyranoScript : function(str) {

        var result = TYRANO.kag.parser.parseScenario(str);

        var array_s = result.array_s;
        for (var i = 0; i < array_s.length; i++) {
            var tag = array_s[i];
            this.app.rider_view.pushConsoleGrid("tag", tag);
            this.cutTyranoTag(tag.name, tag.pm);
        }

    },

    insertElement : function(category, file) {
        
        var path = "./data/" + category + "/" + file;
            
        if(category=="fgimage" || category =="image"){
            var j_img = $("<div style='position:absolute;z-index:9999999;'><div class='area_pos' style='position:absolute;width:100px;opacity:0.5;background-color:black;color:white'></div><div class='button_delete' style='position:absolute;right:0px;border:solid 1px gray;background-color:white;width:20px;height:20px;cursor:pointer' >×</div><img style='border:solid 1px green;' src='"+path+"' /></div>");
            
            (function(){
                
                var _j_img = j_img;
                var _category = category;
                var _file = file;
                
                
                j_img.draggable({
        
                    scroll : false,
                    //containment:".tyrano_base",
                    stop : function(e, ui) {
                        
                        //j_x.html(ui.position.left);
                        //j_y.html(ui.position.top);
                        _j_img.find(".area_pos").html("x:"+ui.position.left+" y:"+ui.position.top);
                        
                        //タグのプレビューがここに表示される
        
                    }
                });
                
                _j_img.find(".button_delete").click(function(){
                    _j_img.remove();
                });
                
                //ドラッグを出来るように
                $(".tyrano_base").attr("ondragstart","");
                $(".tyrano_base").append(_j_img);
            
            })();
            
        }else if(category =="bgimage"){
            //背景画像変更
            var j_new_bg = TYRANO.kag.layer.getLayer("base", "fore");
            j_new_bg.css("background-image","url("+path+")");
            
        }
    
    },

    //シナリオのラベル一覧を取得する
    getScenario : function(scenario_name, call_back) {

        var that = this;

        var file_url = "./data/scenario/" + scenario_name;

        $.loadText(file_url, function(text_str) {

            var result_obj = TYRANO.kag.parser.parseScenario(text_str);

            if (call_back) {
                call_back(result_obj);
            }

        });
        //ラベルの一覧を取得

        //呼び出し元（riderの関数呼び出し方法）
        //window.opener.myFunc();

    },
    
    //キャラクター情報を返却する
    getCharaInfo:function(){
        
        return TYRANO.kag.stat.charas;
        
    },

    //変数を取得する
    getVariables : function() {
        var map_variable = TYRANO.kag.variable;

        var f = TYRANO.kag.stat.f;
        var mp = TYRANO.kag.stat.mp;

        map_variable.f = f;
        map_variable.mp = mp;

        return map_variable;
    },

    //ライダー側で変数が編集された
    evalScript : function(str) {
        TYRANO.kag.evalScript(str);
    },

    //変数値を更新します
    pushVariableGrid : function() {
        //更新が合ったことを通知するだけ
        this.app.rider_view.updateVariable();
    },
    
    initSave:function(){
        localStorage.clear();
    },

    //命令が実行されて、デバッグツール側にコンソールを発信する
    pushConsoleLog : function(tag) {
        //タグをアプリ側にプッシュします
        this.app.rider_view.pushConsoleGrid("tag", tag);

    }
};

