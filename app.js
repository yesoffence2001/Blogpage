//jshint esversion:6
//This app is deployed at	https://blogwebsite-dnr8.onrender.com
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

main().catch(err => console.log(err));

const homeStartingContent = "We provide a medium to write your ideas through blogs.The best ideas can change who we are. This is where those ideas take shape, take off, and spark powerful conversations. We’re an open platform where readers come to find insightful and dynamic thinking. Here, expert and undiscovered voices alike dive into the heart of any topic and bring new ideas to the surface. Our purpose is to spread these ideas and deepen understanding of the world.";
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret : "Our secret.",
  resave : false,
  saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());
async function main() {
  await mongoose.connect('mongodb+srv://Lavish:nsit1995@cluster0.sgubogk.mongodb.net/?retryWrites=true&w=majority');
}

const userSchema = new mongoose.Schema({
})

const postSchema = new mongoose.Schema({
  title: String,
  content : String,
  username : String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('User', userSchema);
const Post = mongoose.model('Post',postSchema);

passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
  res.redirect("/home");
});

app.get("/home",function(req,res){
  if(req.isAuthenticated()){
    Post.find({},function(err,results){
      if(err) console.log(err);
      else{
        res.render("home", {
          startingContent: homeStartingContent,
          posts : results,
          username : req.user.username
        });
      };
    });
  }
  else{
    res.redirect("/login");
  }
});

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/contact", function(req, res){
  res.render("contact");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.post("/login",function(req,res){
  const user = new User({
    username : req.body.username,
    password : req.body.password
  });

  req.login(user, function(err){
    if(err) console.log(err);
    else{
        passport.authenticate("local")(req, res, function(){
        res.redirect("/home");
      });
    }
  });
});

app.get("/register",function(req,res){
  res.render("register");
});
app.get("/logout",function(req,res){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

app.post("/register",function(req,res){
  User.register({username : req.body.username},req.body.password, function(err,user){
    if(err){
       console.log(err);
       res.redirect("/login");
    }
    else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/home");
      });
    }
  });
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", function(req, res){
  const postTitle =  req.body.postTitle;
  const postContent =  req.body.postContent;
  const username = req.user.username;
  const newPost = new Post({
    title : postTitle,
    content : postContent,
    username : username
  });
  newPost.save();
  res.redirect("/home");
});

app.get("/posts/:postId", function(req, res){
  const requestedId = req.params.postId;

  Post.findOne({_id : requestedId},function(err,foundPost){
    if(err) console.log(err);
    else{
      if(!foundPost) res.render("<h1>Aw! No such posts exists</h1>");
      else{
        res.render("post", {
          title: foundPost.title,
          content: foundPost.content
        });
      }
    }
  });

});

app.post("/delete",function(req,res){
  const postId = req.body.deleteButton;
  Post.deleteOne({ _id: postId },function(err,res){
    if(err) console.log(err);
    else console.log("Deleted");
  });
  res.redirect("/home");
});

app.post("/update",function(req,res){
  const postId = req.body.updateButton;
  Post.findOne({_id : postId},function(err,foundPost){
    if(err) console.log(err);
    else{
      res.render("update",{post: foundPost});
    }
  });
});

app.post("/updatedInfoPath",function(req,res){
  const postId = req.body.postId;
  const postTitle = req.body.postTitle;
  const postContent = req.body.postContent;
  Post.findOneAndUpdate({ _id: postId},{ content: postContent},function (err, docs) {
    if (err) console.log(err);
  });
  Post.findOneAndUpdate({ _id: postId},{title : postTitle}, function (err, docs) {
    if (err) console.log(err);
  });
  res.redirect("/home");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
