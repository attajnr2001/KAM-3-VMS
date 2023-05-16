const express = require("express");
const router = express.Router();
const axios = require("axios");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const passport = require("passport");

router.get("", (req, res) => {
  res.render("login", {
    title: "KAM 3 VMS",
  });
});

router.post("/login", async (req, res, next) => {
  const errors = [];
  try {
    const { email, password } = req.body;
    user = await User.findOne({ email: email });
    passport.authenticate("user-local", {
      successRedirect: `/admin/dashboard/${user.role}/${user._id}`,
      failureRedirect: `/`,
      failureFlash: true,
    })(req, res, next);
  } catch (error) {
    errors.push({ msg: "No user found" });
    res.render(`login`, {
      title: "KAM 3 VMS",
      errors,
    });
  }
});

// createUser(
//   "Atta",
//   "Junior",
//   "attajnr731@gmail.com",
//   "000000",
//   "0201610861",
//   "supervisor",
//   "1990-01-01"
// );

async function createUser(
  firstName,
  lastName,
  email,
  password,
  phone,
  role,
  dob
) {
  try {
    const response = await axios.get("http://worldtimeapi.org/api/ip");
    const { utc_datetime } = response.data;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
      phone: phone,
      role: role,
      dob: dob,
      createdAt: utc_datetime,
    });

    await user.save();
    console.log("User created successfully");
  } catch (err) {
    console.error(err);
  }
}

module.exports = router;
