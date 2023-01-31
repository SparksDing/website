const dummyData = require('./dummy-data')
const CrudAPI = require("./crud").CrudAPI
const express = require('express')
const multer = require("multer")
const expressHandlebars = require('express-handlebars')
const bcrypt = require('bcrypt');
const redisSrv = require("./redis-server")
const redis = require("redis")
const session = require("express-session")
var fs = require('fs');
// var upload = multer({ 
//   dest: 'public/resource', 
//   filename(req, file, cb) {
//     console.log(file)
//     const filenameArr = file.originalname.split('.');
//     cb(null, filenameArr[filenameArr.length-1]);
//   } 
// })


const storage = multer.diskStorage({
  // destination:'public/uploads/'+new Date().getFullYear() + (new Date().getMonth()+1) + new Date().getDate(),
  destination(req,res,cb){
    cb(null, 'public/resource/')
  },
  filename(req,file,cb){
    //console.log(file)
    const filenameArr = file.originalname;
    cb(null, filenameArr);
  }
})


var upload = multer({ storage: storage })

let RedisStore = require("./")(session)


// const redis_config = {
//   "host": "127.0.0.1",
//   "port": 6379
// }


const app = express()
app.set('view engine', 'jade');
app.use(express.static("public"))
app.use(express.urlencoded( {extended: false} ))
app.use(session({
  secret: "hello world",
  cookie: { maxAge: 1000 * 60 * 60 * 24 },
  resave: true,
  saveUninitialized: true
}))


// var client = redis.createClient(process.env.REDISCLOUD_URL, {no_ready_check: true})
var client = redis.createClient(process.env.REDISCLOUD_URL);
// var client = redis.createClient(redis_config)

app.engine("hbs", expressHandlebars.engine({
  defaultLayout: 'main.hbs'
}))

app.get('/', function(request, response){
  response.redirect("/home")
})

app.get('/home', function(request, response) {
  var store = new RedisStore({ client })
  store.get(request.sessionID, (err, result_store) => {
      // console.log(result)
      if(result_store == null) {
        const model = {
          Home: true,
          login_status: false
        }
        response.render("index.hbs", model)
      } else {
        const model = {
          Home: true,
          login_status: true
        }
        response.render("index.hbs", model)
      }
    })
  })

app.get('/blog_operations', function(request, response) {
  response.render("blog_operation.hbs")
})

function transformTime(timestamp) {
  if (timestamp) {
      var time = new Date(timestamp);
      var y = time.getFullYear();
      var M = time.getMonth() + 1; 
      var d = time.getDate(); 
      var h = time.getHours(); 
      var m = time.getMinutes(); 
      var s = time.getSeconds(); 
      return y + '-' + M + '-' + d + ' ' + h + ':' + m + ':' + s;
    } else {
        return '';
    }
}

app.get('/portfolio', function(request, response) {
  var store = new RedisStore({ client })
  store.get(request.sessionID, (err, result_store) => {
    // console.log(result)
    if(result_store == null) {
      var files = fs.readdirSync('./public/resource');
      //console.log(files)
      var image_files = []
      for(let i = 0; i < files.length; ++ i) {
        image_files.push({"file_name": files[i], "portfolio_author": false})
      }
      const model = {
        search: true,
        search_path: "search_portfolio",
        portfolio: true,
        portfolio_author: false,
        login_status: false,
        images: image_files
      }
      response.render("index.hbs", model)
    } else {
      if(result_store.data == "login") {
        // console.log(result)
        var files = fs.readdirSync('./public/resource');
        //console.log(files)
        var image_files = []
        var flag = false;
        if(result_store.username == "liho21ia") {
          flag = true;
        }
        for(let i = 0; i < files.length; ++ i) {
          image_files.push({"file_name": files[i], "portfolio_author": flag})
        }
        const model = {
          search: true,
          search_path: "search_portfolio",
          portfolio: true,
          portfolio_author: flag,
          login_status: true,
          images: image_files
        }
        response.render("index.hbs", model)

    }
}})
})

app.post('/delete_portfolio', function(request, response) {
  console.log(request.body.delete_portfolio_path)

  fs.unlinkSync(`${__dirname}/public/resource/${request.body.delete_portfolio_path}`); // __dirname：当前文件所在目录
  response.redirect("/portfolio")
})

app.post("/upload", upload.single("file"), (request, response) => {
  // console.log("upload file")
  response.redirect("/portfolio")
})

app.get('/index', function(request, response) {
  // console.log(request.sessionID)
  var store = new RedisStore({ client })
  store.get(request.sessionID, (err, result_store) => {
    // console.log(result)
    if(result_store == null) {
      CrudAPI.get_blog_all((err, result) => {
        if(err) {
          response.redirect("/index")
        }
        result_post = []
        for(let i = 0; i < result.length; ++ i) {
          result[i].createTime = transformTime(result[i].createTime)
          // result[i].title = result[i].createTime + "   " + result[i].title
          result_post.push({"id": result[i].id, "title": result[i].title, "createTime": result[i].createTime, "author": false})
        }
        const model = {
          search: true,
          search_path: "search",
          blog: true,
          author: false,
          login_status: false,
          Blogs: result_post
        }
        response.render("index.hbs", model)
      })
    } else {
      CrudAPI.get_blog_all((err, result) => {
        if(err) {
          response.redirect("/index")
        }
        result_post = []
        var flag = false;
        if(result_store.username == "liho21ia") {
          flag = true;
        }
        for(let i = 0; i < result.length; ++ i) {
          result[i].createTime = transformTime(result[i].createTime)
          // result[i].title = result[i].createTime + "   " + result[i].title
          result_post.push({"id": result[i].id, "title": result[i].title, "createTime": result[i].createTime, "author": flag})
        }
        // console.log(result_store)
        
        // console.log(flag)
        const model = {
          search: true,
          search_path: "search",
          blog: true,
          author: flag,
          login_status: true,
          Blogs: result_post
        }
        response.render("index.hbs", model)
      })
    }
  })
})

app.post('/search', function(request, response) {

  var store = new RedisStore({ client })
  store.get(request.sessionID, (err, result_store) => {
    // console.log(result)
    if(result_store == null) {
      CrudAPI.get_blog_like(request.body.search, (err, result) => {
        if(err) {
          response.redirect("/index")
        }
        
        for(let i = 0; i < result.length; ++ i) {
          result[i].createTime = transformTime(result[i].createTime)
          // result[i].title = result[i].createTime + "   " + result[i].title
        }
        //console.log(result)
        const model = {
          search: true,
          search_path: "search",
          blog: true,
          login_status: false,
          Blogs: result
        }
        response.render("index.hbs", model)
      })
    } else {
      CrudAPI.get_blog_like(request.body.search, (err, result) => {
        if(err) {
          response.redirect("/index")
        }
        
        for(let i = 0; i < result.length; ++ i) {
          result[i].createTime = transformTime(result[i].createTime)
          // result[i].title = result[i].createTime + "   " + result[i].title
        }
        //console.log(result)
        const model = {
          search: true,
          search_path: "search",
          blog: true,
          login_status: true,
          Blogs: result
        }
        response.render("index.hbs", model)
      })
    }

  })
    
})


app.post('/search_portfolio', function(request, response) {
  var store = new RedisStore({ client })
  store.get(request.sessionID, (err, result_store) => {
    // console.log(result)
    if(result_store == null) {
      var files = fs.readdirSync('./public/resource');
      //console.log(files)
      var image_files = []
      for(let i = 0; i < files.length; ++ i) {
        if(files[i] != request.body.search) {
          continue
        }
        image_files.push({"file_name": files[i]})
      }
      const model = {
        search: true,
        search_path: "search_portfolio",
        portfolio: true,
        portfolio_author: false,
        login_status: false,
        images: image_files
      }
      response.render("index.hbs", model)
    } else {
      if(result_store.data == "login") {
        // console.log(result)
        var files = fs.readdirSync('./public/resource');
        //console.log(files)
        var image_files = []
        var flag = false;
        if(result_store.username == "liho21ia") {
          flag = true;
        }
        for(let i = 0; i < files.length; ++ i) {
          if(files[i] != request.body.search) {
            continue
          }
          image_files.push({"file_name": files[i]})
        }
        const model = {
          search: true,
          search_path: "search_portfolio",
          portfolio: true,
          portfolio_author: flag,
          images: image_files,
          login_status: true,
        }
        response.render("index.hbs", model)

    }
}})
})

app.post('/search_faq', function(request, response) {
  // console.log(request.body.search)
  var store = new RedisStore({ client })
  store.get(request.sessionID, (err, result_store) => {
    // console.log(result)
    if(result_store == null) {
      CrudAPI.get_faq_like(request.body.search, (err, result) => {
        if(err) {
          // console.log(err)
          response.redirect("/index")
        } else {

          // console.log(result)
          result_post = []
          for(let i = 0; i < result.length; ++ i) {
            result_post.push({"id": result[i].id, "question": result[i].question, "answer": result[i].answer, "author": false})
          }
          // console.log(result)
          const model = {
            search: true,
            search_path: "search_faq",
            faq: true,
            FAQ: result_post,
            login_status: false,
          }
          response.render("index.hbs", model)
        }
      })
    } else {
      CrudAPI.get_faq_like(request.body.search, (err, result) => {
        if(err) {
          // console.log(err)
          response.redirect("/index")
        } else {

          // console.log(result)
          result_post = []
          for(let i = 0; i < result.length; ++ i) {
            result_post.push({"id": result[i].id, "question": result[i].question, "answer": result[i].answer, "author": false})
          }
          // console.log(result)
          const model = {
            search: true,
            search_path: "search_faq",
            faq: true,
            FAQ: result_post,
            login_status: true,
          }
          response.render("index.hbs", model)
        }
      })
    }

})
      
})


app.get('/blog/:id', function(request, response){
  var store = new RedisStore({ client })
  store.get(request.sessionID, (err, result_store) => {
    // console.log(result)
    if(result_store == null) {
      const id = request.params.id
      // console.log(id)
      CrudAPI.get_blog(id, (err, result) => {
        if(err) {
          response.redirect("/index")
        }
        
        // console.log(result)
        const model = {
          search: false,
          blogpage: true,
          title: result.title,
          login_status: false,
          content: result.content
        }
        response.render("index.hbs", model)
      })
    } else {
      const id = request.params.id
      // console.log(id)
      CrudAPI.get_blog(id, (err, result) => {
        if(err) {
          response.redirect("/index")
        }
        
        // console.log(result)
        const model = {
          search: false,
          blogpage: true,
          title: result.title,
          login_status: true,
          content: result.content
        }
        response.render("index.hbs", model)
      })
    }

  })

})

app.get('/login', function(request, response) {
  response.render("login.hbs")
})

app.get('/add_blog', function(request, response) {
  var store = new RedisStore({ client })
  store.get(request.sessionID, (err, result) => {
    // console.log(result)
    if(result == null) {
      response.redirect("/login")
    } else {
      if(result.data == "login") {
        response.render("blog_operation.hbs")
      } else response.redirect("/login")
    }
  })
})

app.post('/add_blog', function(request, response) {
  // console.log(request.body.title, request.body.content)
  CrudAPI.add_blog(request.body.title, request.body.content, (err, data) => {
    if(err) {
      console.log("add blog failed")
      response.redirect("/add_blog")
    } else {
      response.redirect("/add_blog")
    }
  })
  
})

app.get("/about", function(request, response) {
  var store = new RedisStore({ client })
  store.get(request.sessionID, (err, result_store) => {
    // console.log(result)
    if(result_store == null) {
      const model = {
        aboutMe: true,
        login_status: false,
      }
      response.render("index.hbs", model)
    } else {
      const model = {
        aboutMe: true,
        login_status: true,
      }
      response.render("index.hbs", model)
    }

  })

})


app.get("/contact", function(request, response) {
  var store = new RedisStore({ client })
  store.get(request.sessionID, (err, result_store) => {
    // console.log(result)
    if(result_store == null) {
      const model = {
        contactMe: true,
        login_status: false,
      }
      response.render("index.hbs", model)
    } else {
      const model = {
        contactMe: true,
        login_status: true,
      }
      response.render("index.hbs", model)
    }

  })

})



app.get("/freq_ask_question", function(request, response) {
  var store = new RedisStore({ client })
  store.get(request.sessionID, (err, result_store) => {
    // console.log(result)
    if(result_store == null) {
      CrudAPI.get_faq_all((err, result) => {
        if(err) {
          response.redirect("/freq_ask_question")
        }
        result_post = []
        for(let i = 0; i < result.length; ++ i) {
          result_post.push({"id": result[i].id, "question": result[i].question, "answer": result[i].answer, "author": false})
        }
        // console.log(result)
        const model = {
          search: true,
          search_path: "search_faq",
          faq: true,
          faq_author: false,
          login_status: false,
          FAQ: result_post
        }
        response.render("index.hbs", model)
      })
    } else {
      CrudAPI.get_faq_all((err, result) => {
        if(err) {
          response.redirect("/freq_ask_question")
        }
        result_post = []
        var flag = false;
        if(result_store.username == "liho21ia") {
          flag = true;
        }
        for(let i = 0; i < result.length; ++ i) {
          result_post.push({"id": result[i].id, "question": result[i].question, "answer": result[i].answer, "author": flag})
        }
        // console.log(result)
        const model = {
          search: true,
          search_path: "search_faq",
          faq: true,
          faq_author: flag,
          login_status: true,
          FAQ: result_post
        }
        response.render("index.hbs", model)
      })
    }
  })
})


app.get('/register', function(request, response) {
  response.render("register.hbs")
})

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
      response.render("login.hbs")
    } else {
      // console.log(data)
      const hash = data.password_hash
      const result = bcrypt.compareSync(request.body.passwd, hash);
      if(result == false) {
        response.render("login.hbs")
      }
      else response.redirect("/index")
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


app.post("/add_faq", function(request, response) {
  CrudAPI.add_faq(request.body.question, request.body.answer, (err, data) => {
    if(err) {
      console.log("add freq_ans_question failed!")
    }
  })
  response.redirect("/freq_ask_question")
})

app.post("/delete_faq", function(request, response) {
  const number = parseInt(request.body.delete_faq_id)
  CrudAPI.delete_faq(number)
  response.redirect("/freq_ask_question")
})

app.post("/update_faq", function(request, response) {
  const number = parseInt(request.body.update_faq_id)
  CrudAPI.update_faq(request.body.answer_update, number)
  response.redirect("/freq_ask_question")
})

app.post("/delete_blog", function(request, response) {
  const number = parseInt(request.body.delete_blog_id)
  // console.log(number)
  CrudAPI.delete_blog(number)
  response.redirect("/index")
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
  response.redirect("/login")
})

app.listen(process.env.PORT || 8080)