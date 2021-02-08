if(name!=="bz-master"){
  var script = document.createElement("script");
  script.type = "application/javascript";
  script.textContent = "(" + (function() {
    let _fun=EventTarget.prototype.addEventListener;
    EventTarget.prototype._addEventListener = _fun
    
    EventTarget.prototype.addEventListener=function(t,f,c){
      if(EventTarget.prototype._addEventListener != _fun){
        EventTarget.prototype._addEventListener = _fun
      }
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