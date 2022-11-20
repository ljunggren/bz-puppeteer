'use strict';
process.env.ORA_SDTZ = 'UTC';
const axios = require('axios');
const https=require("https")
try{
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  })
  axios.defaults.httpsAgent = httpsAgent
}catch(ex){
  console.log(ex.message)
}
exports.api={
  route:async function(req,res){
    let d=req.body
    axios(d).then(function (response) {
      res.headers=response.headers
      res.status(response.status).send(response.data);
    }).catch(function (error) {
      console.log("Request:")
      console.log(d)
      console.log("Response error:")
      console.log(error.message);
      if(error.response){
        res.headers=error.response.headers
        res.statusText=error.response.statusText
        res.status(error.response.status).send(error.response.data)
      }else{
        console.log(error);
        res.status(error.status||500).send({message:error.message})
      }

    });

  }
};