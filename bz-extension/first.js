if(name!=="bz-master"){
  var script = document.createElement("script");
  script.type = "application/javascript";
  script.textContent = "(" + (function() {
    
    EventTarget.prototype._addEventListener = EventTarget.prototype.addEventListener;
    
    EventTarget.prototype.addEventListener=function(t,f,c){
      if(this==window&&t=="beforeunload"){
        this._addEventListener(t,function(event){
          let play=localStorage.getItem("playModel")
          if(t=="beforeunload"&&play=="play"){
          }else{
            return f(event)
          }
        },c)
      }else{
        this._addEventListener(t,f,c)
      }
    }
  }) + ")();";
  document.documentElement.appendChild(script);
}