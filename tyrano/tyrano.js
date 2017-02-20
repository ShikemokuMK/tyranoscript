function object(o) {
  var f = object.f, i, len, n, prop;
  f.prototype = o;
  n = new f;
  for (i=1, len=arguments.length; i<len; ++i)
    for (prop in arguments[i])
      n[prop] = arguments[i][prop];
  return n;
}

object.f = function(){};

var tyrano ={};
tyrano.plugin ={};

tyrano.core ={

    base:null,

    options:{
        
        width:0,
        height:0,
        onComplete:function(){}
        
    },
    
    status:{
        loaded_plugin:0
    },
    
    
    init:function(options){
        
        var that = this;
        
        this.base = object(tyrano.base);
        this.base.init(this);
        
        this.config = window.config;
        
        
        //スクリプトをロードして、そのオブジェクトを作成
        //alert("wwwww");
        that.loadModule();
        
    },
    
    //プラグインのロード処理
    loadPlugins:function(array_src,call_back){
        
        var that = this;
        
        var count_src = 0;
        
        for(var i=0; i<array_src.length; i++){
            
            $.getScript("./tyrano/plugins/"+array_src[i]+"/"+array_src[i]+".js", function(){
                
                count_src++;
                
                if(count_src == array_src.length){
                    if(call_back){
                        call_back(array_src);
                    }  
                }
            });
            
        }
        
    },
    
    loadModule:function(){

        var that = this;
        var array_src = ["kag"];

        for(var i=0;i<array_src.length;i++){
        
            var _name = array_src[i]; 
            this[_name] = object(tyrano.plugin[_name]);
            //操作を委譲　
            this[_name].tyrano = this;
            this[_name].init();
            
        }
        
        this.completeLoad();
          
    },
    
    
    //
    completeLoad:function(){
        
        //console.log(plugin_name);
        
        //読み込み対象のプラグイン数分実行されたらビルド処理へ
        this.build();
        
        
    },
    
    //ローディング完了、システムを組み上げていきます
    build:function(){
        
        
    },
    
    get:function(mark){
        return $(mark);
    },
    
    test:function(){
        //alert("tyrano test");
    }
};



var TYRANO = object(tyrano.core);
window.TYRANO = TYRANO;

if (!('console' in window)) {
 
          window.console = {};
          window.console.log = function(str){
              return str;
          };
     }
    
$(function(){
    //画面をノベル用に構築していくみたいな
    //yunagi.init();
    //DOM構築完了後の初期化
    //yunagi.init_loaded();
TYRANO.init();
    
});
