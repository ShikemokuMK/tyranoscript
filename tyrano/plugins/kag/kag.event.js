
//イベント管理用のクラス
tyrano.plugin.kag.event ={

    tyrano:null,
    
    init:function(){
     
        //alert("kag.order 初期化");
        //this.tyrano.test();
        
        //同じディレクトリにある、KAG関連のデータを読み込み
        
    },
    
    //イベント用のエレメントを設定する 
    addEventElement:function(obj){
        
        var j_obj = obj.j_target;
        
        j_obj.addClass("event-setting-element");
        j_obj.attr("data-event-target",obj.target);
        j_obj.attr("data-event-storage",obj.storage);
        j_obj.attr("data-event-tag",obj.tag);
        
        //パラメータを格納してみてはどうか？
        j_obj.attr("data-event-pm",JSON.stringify(obj.pm));
        
        
    }
};


