
//コンバート実行機能
class ThreeModel {

    constructor(obj){
        
        this.model = obj.model;
        this.mixer = obj.mixer;
        
        this.opacity(0);
        
    }   
    
    //音楽ディレクトリと効果音ディレクトリの２つを変換する
    update(delte_time){
        
        this.mixer.update(delte_time);
        
    }
    
    
    fade(direction,options){
        
        options = options || {};
        // set and check 
        var from_opacity = (direction == "in") ? 0 : 1;
        var to_opacity = (from_opacity == 0 )? 1 : 0;
        
        var easing = options.easing || "linear";
        var duration = options.duration || 1000;
        
        var j_obj = $("<input type='hidden'>");
        j_obj.css("opacity",from_opacity);
        
        var timer = j_obj.animate(
            {"opacity":to_opacity},
            {
                duration: duration,
                easing: 'linear',
                step : (now,elem)=>{
                    this.opacity(now);
                },
                complete:()=> {
                    j_obj.remove();
                }
            }
        );
        
        
        return;
        
    
    }
    
    
    opacity(val){
        
        this.model.traverse(function(node) {
            if(node.isMesh){
                node.material.transparent = true;
                node.material.opacity = val;
            }
        });
        
        
    }


}
