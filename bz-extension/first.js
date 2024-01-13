if(window.name!="bz-master"){
  console.log("bz-client .....")
  var script = document.createElement("script");
  script.type = "application/javascript";
  script.textContent = "(" + (function() {
    let _fun=window.constructor.prototype.addEventListener
    window.constructor.prototype._addEventListener = _fun
    
    window.constructor.prototype.addEventListener=function(t,f,c){
      if(t=="beforeunload"){
        this._addEventListener(t,function(event){
          let play=localStorage.getItem("playModel")
          if(play=="pause"||play=="play"){
          }else{
            return f(event)
          }
        },c)
      }else{
        try{
          this._addEventListener(t,f,c)
        }catch(ex){
          console.log(ex.stack)
          debugger
        }
      }
    }
  }) + ")();";
  document.documentElement.appendChild(script);
}