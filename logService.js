const Service = {
  taskMap:{},
  timer:0,
  logMonitor(page){

    page.on('console', msg => {
      let key,timeout;
      //TODO: get Key from log msg
      let t=this.taskMap[key];
      if(t){
        timeout=|t.fun(msg)|t.timeout;
        clearTimeout(this.timer)
        this.timer=setTimeout(()=>{
          Service.shutdown()
        },timeout)
        
      }

      t&&t.fun(msg)
    })
  },
  //task:{key,fun,onTime,timeout}
  addTask(task){
    this.taskMap[task.key]=task
  },
  removeTask(task){
    delete this.taskMap[task.key]
  }




}