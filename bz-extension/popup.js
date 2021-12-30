var bzFormat;
$("#home").click(()=>{
  chrome.tabs.create({url: "https://ai.boozang.com"});
})
$("#formatPage").click(()=>{
  chrome.tabs.query({active: true, currentWindow: true}, function(v){
    chrome.runtime.sendMessage({ pop:1,fun:"formatLog",data:{
      id:v[0].id,
      data:bzFormat
    }});
    
  });
});
$("#infoTab").click(function(){
  $("#info-panel").show()
  $("#log-panel").hide()
  $("#logTab").removeClass("bz-active")
  $(this).addClass("bz-active")
});
$("#logTab").click(function(){
  $("#log-panel").show()
  $("#info-panel").hide()
  $("#infoTab").removeClass("bz-active")
  $(this).addClass("bz-active")
})

function getPageInfo(){
  chrome.tabs.query({active: true, currentWindow: true}, function(v){
    chrome.runtime.sendMessage({ pop:1,fun:"getPageInfo",data:v[0].id},(v)=>{
      console.log(v)
    });
    
  });
}

function init(){
  bzFormat=localStorage.getItem("bz-log-format")||{
    testTime:180,
    actionTime:3,
    declareTime:6,
    initTime:2,
    autoFormat:false,
    retrieveWorkerLog:false,
    identifyMaster:`function(){
  return location.href.match(/[\/]console(Full)?$/)
}`,
    identifyWorker:`function(){
  return [2,3].map(x=>{
    return location.href.replace(/[\\/][0-9]+[\\/]console(Full)?/,"/ws/out_"+x+".log")
  })
}`
  }

  if(bzFormat.constructor==String){
    bzFormat=JSON.parse(bzFormat)
  }
  
  $("#autoFormat").attr("checked",bzFormat.autoFormat);
  $("#retrieveWorkerLog").attr("checked",bzFormat.retrieveWorkerLog);
  
  $("#identifyMaster").val(bzFormat.identifyMaster)
  $("#identifyWorker").val(bzFormat.identifyWorker)
  $("#testTime").val(bzFormat.testTime);
  $("#declareTime").val(bzFormat.declareTime);
  $("#initTime").val(bzFormat.initTime);
  $("#actionTime").val(bzFormat.actionTime)
  updateSetting()
  $("#testTime,#declareTime,#initTime,#actionTime,#identifyMaster,#identifyWorker").blur(function(){
    updateSetting()
  })
  $("#autoFormat").click(function(){
    updateSetting()
  })
  $("#retrieveWorkerLog").click(function(){
    updateSetting()
  })
}

function updateSetting(){
  bzFormat.autoFormat=$("#autoFormat")[0].checked
  bzFormat.identifyMaster=$("#identifyMaster").val()
  if(bzFormat.autoFormat){
    $("#pageScriptPanel").show()
  }else{
    $("#pageScriptPanel").hide()
  }

  bzFormat.retrieveWorkerLog=$("#retrieveWorkerLog")[0].checked
  bzFormat.identifyWorker=$("#identifyWorker").val()
  if(bzFormat.retrieveWorkerLog){
    $("#workerScriptPanel").show()
  }else{
    $("#workerScriptPanel").hide()
  }
  bzFormat.testTime=$("#testTime").val()
  bzFormat.declareTime=$("#declareTime").val()
  bzFormat.initTime=$("#initTime").val()
  bzFormat.actionTime=$("#actionTime").val()
  localStorage.setItem("bz-log-format",JSON.stringify(bzFormat))
  
  
  chrome.tabs.query({active: true, currentWindow: true}, function(v){
    chrome.runtime.sendMessage({ pop:1,fun:"updateFormatLogSetting",data:{
      id:v[0].id,
      data:bzFormat
    }});
    
  });  
}
init();
getPageInfo();
