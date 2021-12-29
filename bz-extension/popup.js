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
    chkTest:true,
    chkAction:true,
    testTime:180,
    actionTime:3,
    groupModule:false,
    order:"process"
  }

  if(bzFormat.constructor==String){
    bzFormat=JSON.parse(bzFormat)
  }
  $("#groupModule").attr("checked",bzFormat.groupModule);
  if(bzFormat.order=="id"){
    $(".order")[1].checked=true
  }else{
    bzFormat.order="process"
    $(".order")[0].checked=true
  }
  
  $("#chkTest").attr("checked",bzFormat.chkTest);
  $("#chkAction").attr("checked",bzFormat.chkAction);
  $("#testTime").val(bzFormat.testTime);
  $("#actionTime").val(bzFormat.actionTime)
  
  $("#chkTest,#chkAction,#groupModule,.order").bind("click",function(){
    updateSetting()
  })
  $("#testTime,#actionTime").on("change",function(){
    updateSetting()
  })
}

function updateSetting(){
  bzFormat.groupModule=$("#groupModule")[0].checked
  bzFormat.order=$(".order")[0].checked?"process":"id";
  bzFormat.chkTest=$("#chkTest")[0].checked
  bzFormat.chkAction=$("#chkAction")[0].checked
  bzFormat.testTime=$("#testTime").val()
  bzFormat.actionTime=$("#actionTime").val()
  $("#testTime").attr("disabled",!bzFormat.chkTest)
  $("#actionTime").attr("disabled",!bzFormat.chkAction)
  localStorage.setItem("bz-log-format",JSON.stringify(bzFormat))
}
init();
getPageInfo();
