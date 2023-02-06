const CrudAPI = require("./crud").CrudAPI
const express = require('express')
var request = require('request');
const multer = require("multer")
const expressHandlebars = require('express-handlebars')
const bcrypt = require('bcrypt');
const redisSrv = require("./redis-server")
const redis = require("redis")
const session = require("express-session")
var fs = require('fs');
var https = require('https');
var bodyParser = require('body-parser')

let RedisStore = require("./")(session)


// const redis_config = {
//   "host": "127.0.0.1",
//   "port": 6379
// }

const app = express()
app.set('view engine', 'jade');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static("public"))
app.use(express.urlencoded( {extended: false} ))
app.use(session({
  secret: "hello world",
  cookie: { maxAge: 1000 * 60 * 60 * 24 },
  resave: true,
  saveUninitialized: true
}))


// var client = redis.createClient(process.env.REDISCLOUD_URL, {no_ready_check: true})
var client = redis.createClient("redis://localhost:6379");
// var client = redis.createClient(redis_config)



app.get("/logout", function(request, response) {
  var store = new RedisStore({ client })
  store.destroy(request.sessionID, (err) => {

  })
  response.redirect("/home")
})

app.post('/login', function(request, response) {
  CrudAPI.get_hashed_by_name(request.body.username, (err, data) => {
    if(err) {
      console.log("get hashed password failed")
      return response.send("database error")
    } else {
      // console.log(data)
      const hash = data.password_hash
      const result = bcrypt.compareSync(request.body.passwd, hash);
      if(result == false) {
        return response.send("password not correct")
      }
      return response.send("ok")
    }
  })
  // console.log(request.sessionID)
  var store = new RedisStore({ client })
  store.set(request.sessionID,
    {
      cookie: { expires: new Date(Date.now() + 5000000) },
      data: "login",
      username: request.body.username
    },
    (err) => {

    }
  )
})


app.post("/ask_chatgpt", function(req, response) {
  // console.log(req.body)
  var options = {
    'method': 'POST',
    'url': 'https://api.openai.com/v1/completions',
    'headers': {
      'Authorization': 'Bearer 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',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "model": "text-davinci-003",
      "prompt": req.body.text,
      "temperature": 0.5,
      "max_tokens": 1024
    })
  
  };
  request(options, function (error, chatgpt_response) {
    if (error) throw new Error(error);
    console.log(chatgpt_response.body);
    return response.json(chatgpt_response.body)
  });


  // response.json({"id":"cmpl-6fAA1f9BPBrOwEFYkmHSKMIjXt6mX","object":"text_completion","created":1675268525,"model":"text-davinci-003","choices":[{"text":"\n\n多目标追踪（Multi-Object Tracking，MOT）是","index":0,"logprobs":null,"finish_reason":"length"}],"usage":{"prompt_tokens":16,"completion_tokens":29,"total_tokens":45}})
  
})



app.post("/register", function(request, response) {
  const saltRounds = 10
  const salt = bcrypt.genSaltSync(saltRounds)
  const hash = bcrypt.hashSync(request.body.passwd, salt)
  CrudAPI.save_hashed_password(request.body.username, hash, (err, data) => {
    if(err) {
      console.log("register failed")
    }
    console.log("register success, now you can login");
  })
  return response.send("ok")
})

app.listen(process.env.PORT || 8080)