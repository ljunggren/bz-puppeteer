var bzFormat;
$("#home").click(()=>{
  chrome.tabs.create({url: "https://ai.boozang.com"});
})
$("#formatPage").click(()=>{
  chrome.tabs.query({active: true, currentWindow: true}, function(v){
    bzFormat.gotoOrg=0
    chrome.runtime.sendMessage({ pop:1,fun:"formatLog",data:{
      id:v[0].id,
      data:bzFormat
    }});
    window.close();
  });
});
$("#orgPage").click(()=>{
  chrome.tabs.query({active: true, currentWindow: true}, function(v){
    bzFormat.gotoOrg=1
    chrome.runtime.sendMessage({ pop:1,fun:"formatLog",data:{
      id:v[0].id,
      data:bzFormat
    }});
    window.close();
  });
})
$("#infoTab").click(function(){
  $("#info-panel").show()
  $("#log-panel").hide()
  $("#logTab").removeClass("bz-active")
  $(this).addClass("bz-active")
  bzFormat.defTab="info"
  updateSetting()
});
$("#logTab").click(function(){
  $("#log-panel").show()
  $("#info-panel").hide()
  $("#infoTab").removeClass("bz-active")
  $(this).addClass("bz-active")
  bzFormat.defTab="log"
  updateSetting()
})

function getPageInfo(){
  chrome.tabs.query({active: true, currentWindow: true}, function(v){
    chrome.runtime.sendMessage({ pop:1,fun:"getPageInfo",data:v[0].id},(v)=>{
      console.log(v)
    });
    
  });
}

function init(){
  // var image = document.createElement("img");
  // image.src = chrome.runtime.getURL("img/boozang128.png");
  // document.getElementsByTagName("body")[0].appendChild(image);
  var version = chrome.app.getDetails().version;
  $("#version").text("Version: "+ version);

  chrome.storage.sync.get("bz-log-format",function(d){
    console.log("data:")
    console.log(JSON.stringify(d))
    if(!d||!Object.keys(d).length){
      bzFormat={
        defTab:"info",
        scenarioTime:180,
        testTime:60,
        actionTime:3,
        declareTime:6,
        initTime:2,
        autoFormat:false,
        retrieveWorkerLog:false,
        identifyMaster:`function(url){
  return (url||location.href).match(/[\/]console(Full)?$/)
}`,
      identifyWorker:`function(url){
  return [2,3].map(x=>{
    return (url||location.href).replace(/[\\/][0-9]+[\\/]console(Full)?/,"/ws/out_"+x+".log")
  })
}`
      }
    }
    if(d["bz-log-format"]){
      bzFormat=JSON.parse(d["bz-log-format"])
    }
    if(!bzFormat.scenarioTime){
      bzFormat.scenarioTime=180
      if(bzFormat.testTime==180){
        bzFormat.testTime=60
      }
    }
    $("#autoFormat").attr("checked",bzFormat.autoFormat);
    $("#retrieveWorkerLog").attr("checked",bzFormat.retrieveWorkerLog);
    
    $("#identifyMaster").val(bzFormat.identifyMaster)
    $("#identifyWorker").val(bzFormat.identifyWorker)
    $("#scenarioTime").val(bzFormat.scenarioTime);
    $("#testTime").val(bzFormat.testTime);
    $("#declareTime").val(bzFormat.declareTime);
    $("#initTime").val(bzFormat.initTime);
    $("#actionTime").val(bzFormat.actionTime)
    updateSetting()
    $("#scenarioTime,#testTime,#declareTime,#initTime,#actionTime,#identifyMaster,#identifyWorker").blur(function(){
      updateSetting()
    })
    $("#autoFormat,#retrieveWorkerLog").click(function(){
      updateSetting()
    })
    if(bzFormat.defTab=="log"){
      $("#logTab").click()
    }
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
  bzFormat.scenarioTime=$("#scenarioTime").val()
  bzFormat.testTime=$("#testTime").val()
  bzFormat.declareTime=$("#declareTime").val()
  bzFormat.initTime=$("#initTime").val()
  bzFormat.actionTime=$("#actionTime").val()
  chrome.storage.sync.set({"bz-log-format":JSON.stringify(bzFormat)})
  
  
  chrome.tabs.query({active: true, currentWindow: true}, function(v){
    chrome.runtime.sendMessage({ pop:1,fun:"updateFormatLogSetting",data:{
      id:v[0].id,
      data:bzFormat
    }});
    
  });  
}
init();
getPageInfo();
