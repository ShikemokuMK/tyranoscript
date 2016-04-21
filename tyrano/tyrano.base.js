
tyrano.base ={
    
    //読み込み対象のモジュール
    tyrano:null,
    modules:[],
    options:{
        
    },
    
    init:function(tyrano){
        this.tyrano = tyrano;
    },
    
    setBaseSize:function(width,height){
        
        this.tyrano.get(".tyrano_base").css("width",width).css("height",height).css("background-color","black");
            
    },
    
    //画面サイズをぴったりさせます
    fitBaseSize:function(width,height){
      
      	var view_width = $.getViewPort().width;
        var view_height = $.getViewPort().height;
        
        var width_f = view_width / width ;
        var height_f = view_height / height;
        
        var scale_f = 0;
        
        var space_width = 0;
        
        var screen_ratio = this.tyrano.kag.config.ScreenRatio;
        
        //比率を固定にしたい場合は以下　以下のとおりになる
        if(screen_ratio =="fix"){
        	
        	if(width_f > height_f){
               scale_f = height_f;
             }else{
                scale_f = width_f;
        	}
        	
        	this.tyrano.kag.tmp.base_scale = scale_f;

            setTimeout(function() {
                
                   $(".tyrano_base").css("transform", "scale(" + scale_f + ") ");
                        if (parseInt(view_width) < parseInt(width)) {
                            if (scale_f < 1) {
                                window.scrollTo(width, height);
                            }
                        }

            }, 100);        	
            
        }else if(screen_ratio =="fit"){
            
            //スクリーンサイズに合わせて自動的に調整される
            setTimeout(function() {
                       $(".tyrano_base").css("transform","scaleX("+width_f+") scaleY("+height_f+")");
                       window.scrollTo(width, height);
            },100);
            
        }else{
        	
        	//スクリーンサイズ固定
        	
        }
       
        
    },
    
    test:function(){
        //alert("tyrano test");
    }
    
};
