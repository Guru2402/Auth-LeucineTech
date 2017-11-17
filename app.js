var express = require("express"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  bodyParser = require("body-parser"),
  User = require("./models/user"),
  mailer = require("nodemailer"),
  LocalStrategy = require("passport-local"),
  passportLocalMongoose = require("passport-local-mongoose");

// ====================================================
// =============== Email & Password ===================

var email = ""; //Enter your email Here
var password = ""; //Enter your password here

// ====================================================
mongoose.connect("mongodb://localhost/leucine");
var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  require("express-session")({
    secret: "Guru is a coder",
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

// ===========================================================
// ======================== Routes ===========================
// ===========================================================

app.get("/", isLoggedIn, function(req, res) {
  res.render("home");
});

app.get("/register", isSuperAdmin, function(req, res) {
  res.render("register");
});

app.post("/register", isSuperAdmin, function(req, res) {
  var name = req.body.fName + " " + req.body.lName;
  console.log(req.body);
  let p = Math.floor(Math.random() * 100000);
  const m = p.toString();
  User.register(
    new User({ username: req.body.username, name, role: req.body.role }),
    m,
    function(err, user) {
      if (err) {
        console.log(err);
        return res.render("register");
      }
      console.log(user);
      if (user) {
        // // MAILER
        // var trans = mailer.createTransport({
        //   service: "gmail",
        //   auth: {
        //     user: email,
        //     pass: password
        //   }
        // });
        //
        // var list = ["jamesstark145@gmail.com", user.email];
        //
        // var mailOptions = {
        //   from: email,
        //   to: user.username,
        //   subject: "Password set",
        //   text: "Password set",
        //   html:
        //     "<br>Hi" +
        //     " " +
        //     user.username +
        //     "," +
        //     "<br>" +
        //     "Your password code is : " +
        //     m +
        //     "<br>Click here to set your new password: http://192.168.1.26:8081/setPassword?u=" +
        //     user.username +
        //     " " +
        //     "</br>" +
        //     "<br>Thanks for using LeucineTech!</br>"
        // };
        //
        // trans.sendMail(mailOptions, function(error, info) {
        //   if (error) {
        //     console.log(error);
        //   } else {
        //     console.log("Message sent:", info.messageId, info.response);
        //   }
        // });
        res.redirect("/");
      } else {
        console.log("This user does not exist");
        res.redirect("/register");
      }
    }
  );
});

app.get("/setPassword", (req, res) => {
  res.render("setPassword", { u: req.query.u });
});

app.post("/setPassword", (req, res) => {
  User.findOne({ username: req.body.username }, (err, users) => {
    if (err) {
      console.log(err);
      res.json(err);
    }
    passport.authenticate("local", (err, user) => {
      console.log(user);
      user.validatePassword(req.body.password, (err, newUser) => {
        if (err) {
          return res.send({ message: err, error: "The credentials are wrong" });
        } else {
          console.log(newUser);
          newUser.setPassword(req.body.password1, (err, newMan) => {
            newMan.save(err => {
              if (err) {
                res.send(err);
              }
              res.redirect("/login");
            });
          });
        }
      });
    })(req, res, () => {});
  });
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
  }),
  function(req, res) {}
);

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/login");
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}
function isSuperAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role == "superAdmin") {
    return next();
  }
  res.redirect("login");
}

app.listen(8081, function() {
  console.log("server started at 8081.......");
});
