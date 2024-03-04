const express = require("express");
const bodyParser = require("body-parser");
const request = require('request');
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const { post } = require("request");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const { time, timeStamp, timeLog, Console } = require("console");
const { functions } = require("lodash");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: "saved",
  resave: false,
  saveUninitialized: false
}));

const arr = [];

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1/medilabDB", {useNewUrlParser: true});
// mongoose.set("useCreateIndex", true);
// const itemSchema = new mongoose.Schema({
//   name: String,
//   age: Number,
//   gender: String,
//   phone: Number,
//   Hospital: String,
//   Department: String,
//   Doctor: String,
//   Date: String,
//   time: String,
//   problem: String
// });

const item = {
  name: String,
  age: Number,
  gender: String,
  phone: Number,
  Hospital: String,
  Department: String,
  Doctor: String,
  Date: String,
  time: String,
  problem: String
};

// const testitem = {
//   name: String,
//   age: Number,
//   gender: String,
//   phone: Number,
//   Hospital: String,
//   Testtype: String,
//   Date: String,
//   time: String
// };

// const meditem = {
//   name: String,
//   phone: Number,
//   Hospital: String,
//   Medicines: String,
//   Address: String
// };



const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    appointment: [item],
    test: [],
    med: []
  });



userSchema.plugin(passportLocalMongoose);

// const Item = new mongoose.model("Item", itemSchema); 
const User = new mongoose.model("User", userSchema); 

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
// console.log(User.username);
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

app.get("/",function(req,res){
    res.render("index");
  }); 


app.get("/register",function(req,res){
    res.render("register");
  });

app.get("/login",function(req,res){
    res.render("login");
    // console.log(arr[0]);
  });

  app.get("/home",function(req,res){
    if (req.isAuthenticated()){
      res.render("home");
    } else {
      // console.log("a");
      res.redirect("/login");
    }
  });


app.get("/logout", function(req, res){
    res.redirect("/");
  });

  app.get("/bookappointment",function(req,res){
    if (req.isAuthenticated()){
      res.render("bookappointment");
    } else {
      res.redirect("/login");
    }
  });

  app.get("/booktest",function(req,res){
    if (req.isAuthenticated()){
      res.render("booktest");
    } else {
      res.redirect("/login");
    }
  });

  app.get("/ordermed",function(req,res){
    if (req.isAuthenticated()){
      res.render("ordermed");
    } else {
      res.redirect("/login");
    }
  });

  app.get("/bookedappointments", function(req, res){
  
      console.log(arr[0]);
      User.find({"username": {$ne: null}}, function(err, foundUser){
      if (err){
        console.log(err);
      } else {
        if (foundUser) {
          res.render("bookedappointments", {users: foundUser ,usermail: arr[0]});
        }
      }
    });

  });

  app.get("/delete", function(req, res){
    res.redirect("/bookedappointments");
  });



  
  app.post("/bookappointment", function(req, res){
    const name = req.body.name;
    const age = req.body.age;
    const gender = req.body.gender;
    const phone = req.body.phone;
    const hospital = req.body.hospital;
    const department = req.body.department;
    const doctor = req.body.doctor;
    const date = req.body.date;
    const time = req.body.time;
    const problem = req.body.problem;

    const item1= new Object();
    item1.name = name;
    item1.age = age;
    item1.gender = gender;
    item1.phone = phone;
    item1.Hospital = hospital;
    item1.Department = department;
    item1.Doctor = doctor;
    item1.Date = date;
    item1.time = time;
    item1.problem = problem;
    
    // const item = new Item({
    //   name: name,
    //   age: age,
    //   gender: gender,
    //   phone: phone,
    //   Hospital: hospital,
    //   Department: department,
    //   Doctor: doctor,
    //   Date: date,
    //   time: time,
    //   problem: problem 
    // });



  //Once the user is authenticated and their session gets saved, their user details are saved to req.user.
  // console.log(req.user.id);
    User.findById(req.user.id, function(err, foundUser){
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          foundUser.appointment.push(item1);
          foundUser.save(function(){
            res.redirect("/home");
          });
        }
      }
    });
  });

  app.post("/booktest", function(req, res){
    const name = req.body.name;
    const age = req.body.age;
    const gender = req.body.gender;
    const phone = req.body.phone;
    const hospital = req.body.hospital;
    const test = req.body.testname;
    const date = req.body.date;
    const time = req.body.time;

    const item2= new Object();
    item2.name = name;
    item2.age = age;
    item2.gender = gender;
    item2.phone = phone;
    item2.Hospital = hospital;
    item2.Testtype = test;
    item2.Date = date;
    item2.time = time;
    
    User.findById(req.user.id, function(err, foundUser){
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          foundUser.test.push(item2);
          foundUser.save(function(){
            res.redirect("/home");
          });
        }
      }
    });
  });

  app.post("/ordermed", function(req, res){
    const name = req.body.name;
    const phone = req.body.phone;
    const hospital = req.body.hospital;
    const medicines = req.body.medicines;
    const address = req.body.address;

    const item3= new Object();
    item3.name = name;
    item3.phone = phone;
    item3.hospital = hospital;
    item3.medicines = medicines;
    item3.address = address;
    
    User.findById(req.user.id, function(err, foundUser){
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          foundUser.med.push(item3);
          foundUser.save(function(){
            res.redirect("/home");
          });
        }
      }
    });
  });


  app.post('/delete', function(req, res) {
    console.log(req.body.id);

    User.findByIdAndDelete(id, function (err, docs) {
      if (err){
          console.log(err)
      }
      else{
          console.log("Deleted : ", docs);
      }
  });



    User.findById(req.id, function(err, foundUser){
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          foundUser.appointment[i].remove({uid: req.params.deleteUid});
          foundUser.save(function(){
            res.redirect("/bookedappointments");
          });
        }
      }
    });
  });


app.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect("/");
  });
});
  
  app.post("/register", function(req, res){
    arr[0]=req.body.username;
    User.register({username: req.body.username}, req.body.password, function(err, user){
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function(){
          res.redirect("home");
        });
      }
    });
  
  });
  
  app.post("/login", function(req, res){
  
    const user = new User({
      username: req.body.username,
      password: req.body.password
    });
    arr[0]=req.body.username;
  
    req.login(user, function(err){
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, function(){
          res.redirect("home");
        });
      }
    });
  
  });



app.listen(3000, function() {
    console.log("Server started on port 3000");
  });