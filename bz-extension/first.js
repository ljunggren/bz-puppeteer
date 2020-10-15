if(name!=="bz-master"){
  var script = document.createElement("script");
  script.type = "application/javascript";
  script.textContent = "(" + (function() {
    
    var addEventListener = EventTarget.prototype.addEventListener;
    
    EventTarget.prototype.addEventListener=function(t,f,c){
      addEventListener(t,function(event){
        console.log(t)
        let play=localStorage.getItem("playModel")
        if(t=="beforeunload"&&play=="play"){
          
        }else{
          return f(event)
        }
      },c)
    }
  }) + ")();";
  document.documentElement.appendChild(script);
}