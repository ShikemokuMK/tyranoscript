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
    
    array_plugins:["kag"], //ロードするプラグイン一覧
    
    init:function(options){
        
        var that = this;
        
        this.base = object(tyrano.base);
        this.base.init(this);
        
        this.config = window.config;
        
        var array_plugins = this.array_plugins;
        
        //スクリプトをロードして、そのオブジェクトを作成
        this.loadPlugins(array_plugins,function(array_src){
            that.loadModule(array_src);
        });
        
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
    
    loadModule:function(array_src){

        var that = this;

        for(var i=0;i<array_src.length;i++){
            this[array_src[i]] = object(tyrano.plugin[array_src[i]]);
            //操作を委譲　
            this[array_src[i]].tyrano = this;
            
            (function(){
                
                var _name = array_src[i]; 
                
                that.loadPluginModules(_name,that[_name].options.modules,
                    function(){
                        that[_name].init();
                        that.completeLoad(_name);
                        
                    });
            
            })();
            
        }
          
    },
    
    //プラグインに付随する関連ファイル読み込み
    loadPluginModules:function(plugin_name,array_plugin_modules,call_back){
        
        var that = this;
        
        var count_src = 0;
        
        //console.log(array_plugin_modules);

        //読み込むモジュールがない場合、コンプリート
        if(array_plugin_modules.length === 0){
            
            call_back(array_plugin_modules);
            
        }
        
        for(var i=0; i<array_plugin_modules.length; i++){
            
            $.getScript("./tyrano/plugins/"+plugin_name+"/"+plugin_name+"."+array_plugin_modules[i]+".js", function(){
                
                count_src++;
                
                if(count_src == array_plugin_modules.length){
                    if(call_back){
                        call_back(array_plugin_modules);
                    }
                }
            });
            
        }
        
    },
    
    //
    completeLoad:function(plugin_name){
        
        //console.log(plugin_name);
        
        //読み込み対象のプラグイン数分実行されたらビルド処理へ
        
        this.status.loaded_plugin++;
        
        //console.log(this.status.loaded_plugin);
        
        if(this.status.loaded_plugin === this.array_plugins.length){
            
            this.build();
        }
        
        
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



if (AC_FL_RunContent == 0) {
    alert("このページでは \"AC_RunActiveContent.js\" が必要です。");
} else {
    AC_FL_RunContent(
        'codebase', 'http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0',
        'width', '1',
        'height', '1',
        'src', 'novel_sound',
        'quality', 'high',
        'pluginspage', 'http://www.macromedia.com/go/getflashplayer',
        'align', 'middle',
        'play', 'true',
        'loop', 'true',
        'scale', 'showall',
        'wmode', 'window',
        'devicefont', 'false',
        'id', 'externalnovelsound',
        'bgcolor', '#ffffff',
        'name', 'externalnovelsound',
        'menu', 'true',
        'allowFullScreen', 'false',
        'allowScriptAccess','always',
        'movie', 'novel_sound',
        'salign', ''
        ); //end AC code
}



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
