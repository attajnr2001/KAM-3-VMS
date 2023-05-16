require("dotenv").config();
const express = require("express");
const port = process.env.port;
const mongoose = require("mongoose");
const ejs = require("ejs");
const layouts = require("express-ejs-layouts");
const flash = require("connect-flash");
const app = express();
const loginRoute = require("./server/routes/login");
const passport = require("passport");
const session = require("express-session");
const dashboardRoute = require("./server/routes/dashboard");

require("./server/config/passport")(passport);

app.set("view engine", "ejs");
app.set("layout", "./layouts/main");

const db = process.env.MongoUri;
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Mongo connected"))
  .catch((err) => console.log(err));

app.use(layouts);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json());

app.use(
  session({
    secret: "secret", // Secret used to sign the session ID cookie
    resave: true,
    saveUninitialized: true,
  })
);

// Initializing passport and session middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.deleteUserSuccess = req.flash("deleteUserSuccess");
  res.locals.deleteUserError = req.flash("deleteUserError");
  res.locals.inactive = req.flash("inactive");
  next();
});

app.use("", loginRoute);
app.use("/admin/dashboard", dashboardRoute);

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
