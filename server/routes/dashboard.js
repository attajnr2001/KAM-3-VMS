const express = require("express");
const router = express.Router();
const axios = require("axios");
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Customer = require("../models/Customer");
const Vehicle = require("../models/Vehicle");
const { ensureAuthenticated } = require("../config/auth");
const passport = require("passport");

router.get("/:role/:_id", ensureAuthenticated, async (req, res) => {
  let { role, _id } = req.params;
  let errors = [];

  let user = await User.findOne({ role: role, _id: _id });

  let customer = await Customer.find({}).sort({ status: 1 });

  let searchQuery = req.query.search;
  if (searchQuery) {
    customer = customer.filter((elt) =>
      elt.firstName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const vehicle = await Vehicle.find({}).sort({ number: 1 });
  const users = await User.find({}).sort({ status: 1, firstName: 1 });

  if (user.status === "active") {
    try {
      res.render("admin/dashboard", {
        title: "KAM 3 VMS",
        user: user,
        users: users,
        customer: customer,
        search: searchQuery,
        vehicle: vehicle,
      });
    } catch (error) {
      console.log(error);
      res.redirect(`/`);
    }
  } else {
    req.flash("inactive", "You have been deactivated");
    res.redirect(`/`);
  }
});

/**
 * customer routes starts here
 */

router.get("/:role/:_id/search", ensureAuthenticated, async (req, res) => {
  const searchQuery = req.query.search;

  try {
    // Find customers whose firstName or lastName matches the search query
    const customer = await Customer.find({
      $or: [
        { firstName: { $regex: searchQuery, $options: "i" } },
        { lastName: { $regex: searchQuery, $options: "i" } },
      ],
    });

    const vehicle = await Vehicle.find({}).sort({ number: 1 });
    const user = await User.find({}).sort({ firstName: 1 });
    const users = await User.find({}).sort({ status: 1, firstName: 1 });

    // Render the "admin/dashboard" view with the search results
    res.render("admin/dashboard", {
      title: "KAM 3 VMS",
      user: user,
      users: users,
      customer: customer,
      vehicle: vehicle,
    });
  } catch (error) {
    console.error(error);
    // Handle any potential errors that may occur
  }
});

// new customer route
router.get("/:role/:_id/newCustomer", ensureAuthenticated, async (req, res) => {
  let { role, _id } = req.params;

  // Find the user based on the role and _id
  const user = await User.findOne({ role: role, _id: _id });

  try {
    res.render("admin/customer/new", {
      title: "KAM 3 VMS",
      user: user,
    });
  } catch (error) {
    console.log(error);
    // Handle any potential errors that may occur during rendering
  }
});

//  add customer post route
router.post(
  "/:role/:_id/newCustomer",
  ensureAuthenticated,
  async (req, res) => {
    let { role, _id } = req.params;

    // Find the user based on the role and _id
    user = await User.findOne({ role: role, _id: _id });

    try {
      // Make a GET request to fetch current UTC datetime from worldtimeapi.org
      const response = await axios.get("http://worldtimeapi.org/api/ip");
      const { utc_datetime } = response.data;

      // Create a new Customer document with data from the request body
      const customer = await new Customer({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
        whatsapp: req.body.whatsapp,
        company: req.body.company,
        dob: req.body.dob,
        gender: req.body.gender,
        lClass: req.body.lClass,
        lNo: req.body.lNo,
        refNo: req.body.refNo,
        issueDate: req.body.issueDate,
        lRenewOne: req.body.lRenewOne,
        lRenewTwo: req.body.lRenewTwo,
        lExpiry: req.body.lExpiry,
        createdAt: utc_datetime,
      });

      // Save the customer's cover image using the saveCover function (not shown in the code)
      saveCover(customer, req.body.cover);

      try {
        // Save the new customer to the database
        const newCustomer = await customer.save();
        res.redirect(`/admin/dashboard/${role}/${_id}`);
      } catch (error) {
        console.log(error);
        // Handle any potential errors that may occur during customer save operation
      }
    } catch (error) {
      console.log(error);
      // Handle any potential errors that may occur during the GET request to worldtimeapi.org
    }
  }
);

// view customer details route
router.get(
  "/:role/:_id/viewCustomer/:customerId",
  ensureAuthenticated,
  async (req, res) => {
    let { role, _id, customerId } = req.params;

    // Find the user based on the role and _id
    const user = await User.findOne({ role: role, _id: _id });
    const vehicle = await Vehicle.find({});
    // Find the customer based on the customerId
    const customer = await Customer.findOne({ _id: customerId });

    try {
      res.render("admin/customer/view", {
        title: "KAM 3 VMS",
        user: user,
        customer: customer,
        vehicle: vehicle,
      });
    } catch (error) {
      console.log(error);
      // Handle any potential errors that may occur during rendering
    }
  }
);

// edit customer get route
router.get(
  "/:role/:_id/editCustomer/:customerId",
  ensureAuthenticated,
  async (req, res) => {
    let { role, _id, customerId } = req.params;

    // Find the user based on the role and _id
    user = await User.findOne({ role: role, _id: _id });

    // Find the customer based on the customerId
    customer = await Customer.findOne({ _id: customerId });

    try {
      res.render("admin/customer/edit", {
        title: "KAM 3 VMS",
        user: user,
        customer: customer,
      });
    } catch (error) {
      // Handle any potential errors that may occur during rendering
    }
  }
);

// update customer post route
router.post(
  "/:role/:_id/editCustomer/:customerId",
  ensureAuthenticated,
  async (req, res) => {
    let { role, _id, customerId } = req.params;

    // Find the user based on the role and _id
    user = await User.findOne({ role: role, _id: _id });

    // Find the customer based on the customerId
    customer = await Customer.findOne({ _id: customerId });

    try {
      // Find the customer again by ID and update the fields
      customer = await Customer.findById(req.params.customerId);
      customer.firstName = req.body.firstName;
      customer.lastName = req.body.lastName;
      customer.phone = req.body.phone;
      customer.whatsapp = req.body.whatsapp;
      customer.company = req.body.company;
      customer.dob = req.body.dob;
      customer.gender = req.body.gender;
      customer.lClass = req.body.lClass;
      customer.lNo = req.body.lNo;
      customer.refNo = req.body.refNo;
      customer.issueDate = req.body.issueDate;
      customer.lRenewOne = req.body.lRenewOne;
      customer.lRenewTwo = req.body.lRenewTwo;
      customer.lExpiry = req.body.lExpiry;

      if (req.body.cover != null && req.body.cover !== "") {
        saveCover(customer, req.body.cover);
      }

      // Save the updated customer to the database
      await customer.save();

      res.redirect(`/admin/dashboard/${role}/${_id}`);
    } catch (error) {
      console.log(error);
      // Handle any potential errors that may occur during customer update or redirection
    }
  }
);

// delete customer route
router.post(
  "/:role/:_id/deleteCustomer/:customerId",
  ensureAuthenticated,
  async (req, res) => {
    let { role, _id, customerId } = req.params;
    user = await User.findOne({ role: role, _id: _id });
    customer = await Customer.findOne({ _id: customerId });

    await Customer.updateOne(
      { _id: customerId },
      { $set: { status: "inactive" } }
    );

    res.redirect(`/admin/dashboard/${role}/${_id}`);
  }
);

function saveCover(customer, coverEncoded) {
  if (coverEncoded == null) return;
  const cover = JSON.parse(coverEncoded);
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    customer.coverImage = new Buffer.from(cover.data, "base64");
    customer.coverImageType = cover.type;
  }
}

/**
 * customer routes ends here
 */

/**
 * vehicle routes starts here
 */

router.get("/:role/:_id/newVehicle", ensureAuthenticated, async (req, res) => {
  let { role, _id } = req.params;

  // Find the user based on the role and _id
  const user = await User.findOne({ role: role, _id: _id });
  const customers = await Customer.find({}).sort({ firstName: 1 });
  const vehicle = await Vehicle.find();

  try {
    res.render("admin/vehicle/new", {
      title: "KAM 3 VMS",
      user,
      customers,
      vehicle,
    });
  } catch (error) {
    console.log(error);
    // Handle any potential errors that may occur during rendering
  }
});

router.post("/:role/:_id/newVehicle", ensureAuthenticated, async (req, res) => {
  let { role, _id } = req.params;

  // Find the user based on the role and _id
  user = await User.findOne({ role: role, _id: _id });

  try {
    // Make a GET request to fetch current UTC datetime from worldtimeapi.org
    const response = await axios.get("http://worldtimeapi.org/api/ip");
    const { utc_datetime } = response.data;

    // Create a new Customer document with data from the request body
    const vehicle = await new Vehicle({
      owner: req.body.owner,
      number: req.body.number,
      name: req.body.name,
      color: req.body.color,
      rwStart: req.body.rwStart,
      rwRenew: req.body.rwRenew,
      insType: req.body.insType,
      insCompany: req.body.insCompany,
      createdAt: utc_datetime,
    });

    try {
      // Save the new vehicle to the database
      const newVehicle = await vehicle.save();
      res.redirect(`/admin/dashboard/${role}/${_id}`);
    } catch (error) {
      console.log(error);
      // Handle any potential errors that may occur during customer save operation
    }
  } catch (error) {
    console.log("axios error");
    // Handle any potential errors that may occur during the GET request to worldtimeapi.org
  }
});

// view vehicle details route
router.get(
  "/:role/:_id/viewVehicle/:vehicleId",
  ensureAuthenticated,
  async (req, res) => {
    let { role, _id, vehicleId } = req.params;

    // Find the user based on the role and _id
    user = await User.findOne({ role: role, _id: _id });

    // Find the vehicle based on the vehicleId
    const vehicle = await Vehicle.findOne({ _id: vehicleId });
    const customer = await Customer.findOne({ _id: vehicle.owner });

    try {
      res.render("admin/vehicle/view", {
        title: "KAM 3 VMS",
        user: user,
        customer: customer,
        vehicle: vehicle,
      });
    } catch (error) {
      // Handle any potential errors that may occur during rendering
    }
  }
);

// edit customer get route
router.get(
  "/:role/:_id/editVehicle/:vehicleId",
  ensureAuthenticated,
  async (req, res) => {
    const { role, _id, vehicleId } = req.params;

    // Find the user based on the role and _id
    const user = await User.findOne({ role: role, _id: _id });

    // Find the customer based on the customerId
    const vehicle = await Vehicle.findOne({ _id: vehicleId });
    const owner = await Customer.findOne({ _id: vehicle.owner });
    const customers = await Customer.find({}).sort({ firstName: 1 });

    try {
      res.render("admin/vehicle/edit", {
        title: "KAM 3 VMS",
        user: user,
        vehicle: vehicle,
        owner: owner,
        customers: customers,
      });
    } catch (error) {
      console.log(error);
      // Handle any potential errors that may occur during rendering
    }
  }
);

router.post(
  "/:role/:_id/editVehicle/:vehicleId",
  ensureAuthenticated,
  async (req, res) => {
    let { role, _id } = req.params;

    // Find the user based on the role and _id
    user = await User.findOne({ role: role, _id: _id });

    try {
      // Create a new Customer document with data from the request body
      const vehicle = await Vehicle.findById(req.params.vehicleId);
      vehicle.owner = req.body.owner;
      vehicle.number = req.body.number;
      vehicle.name = req.body.name;
      vehicle.color = req.body.color;
      vehicle.rwStart = req.body.rwStart;
      vehicle.rwRenew = req.body.rwRenew;
      vehicle.insType = req.body.insType;
      vehicle.insCompany = req.body.insCompany;

      try {
        // Save the new vehicle to the database
        const newVehicle = await vehicle.save();
        res.redirect(`/admin/dashboard/${role}/${_id}`);
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    }
  }
);

/***
 * vehicle routes ends here
 */

// new staff route
router.get("/:role/:_id/newUser", ensureAuthenticated, async (req, res) => {
  let { role, _id } = req.params;

  // Find the user based on the role and _id
  const user = await User.findOne({ role: role, _id: _id });

  try {
    res.render("admin/user/new", {
      title: "KAM 3 VMS",
      user: user,
    });
  } catch (error) {
    console.log(error);
    // Handle any potential errors that may occur during rendering
  }
});

// new staff route
router.post("/:role/:_id/newUser", ensureAuthenticated, async (req, res) => {
  let { role, _id } = req.params;
  let errors = [];

  // Find the user based on the role and _id
  const user = await User.findOne({ role: role, _id: _id });
  const {
    firstName,
    lastName,
    email,
    password2,
    password,
    phone,
    dob,
    userRole,
  } = req.body;

  if (password !== password2) {
    errors.push({ msg: "passwords do not match" });
  }

  if (password.length < 6) {
    errors.push({ msg: "password must be more than 6 letters" });
  }

  if (errors.length > 0) {
    res.render(`admin/user/new`, {
      title: "KAM 3 VMS",
      firstName,
      lastName,
      email,
      password2,
      password,
      phone,
      dob,
      userRole,
      errors,
    });
  } else {
    User.findOne({ email: email }).then(async (user) => {
      if (user) {
        errors.push({ msg: "email already exists" });
        res.render(`admin/user/new`, {
          title: "KAM 3 VMS",
          firstName,
          lastName,
          email,
          password2,
          password,
          phone,
          dob,
          userRole,
          errors,
        });
      } else {
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
            role: userRole,
            dob: dob,
            createdAt: utc_datetime,
          });

          await user.save();
          res.redirect(`/admin/dashboard/${role}/${_id}`);
          console.log("User created successfully");
        } catch (error) {
          console.log(error);
        }
      }
    });
  }
});

// view user details route
router.get(
  "/:role/:_id/viewUser/:userId",
  ensureAuthenticated,
  async (req, res) => {
    let { role, _id, userId } = req.params;

    // Find the user based on the role and _id
    const user = await User.findOne({ role: role, _id: _id });
    const _user = await User.findOne({ _id: userId });

    if (role === "supervisor") {
      try {
        res.render("admin/user/view", {
          title: "KAM 3 VMS",
          user: user,
          _user: _user,
        });
      } catch (error) {
        console.log(error);
      }
    } else {
      res.redirect(`/admin/dashboard/${role}/${_id}`);
    }
  }
);

// edit user get route
router.get(
  "/:role/:_id/editUser/:userId",
  ensureAuthenticated,
  async (req, res) => {
    const { role, _id, userId } = req.params;

    const user = await User.findOne({ role: role, _id: _id });
    const _user = await User.findOne({ _id: userId });

    if (user.role === "supervisor") {
      try {
        res.render("admin/user/edit", {
          title: "KAM 3 VMS",
          user: user,
          _user: _user,
        });
      } catch (error) {
        console.log(error);
        // Handle any potential errors that may occur during rendering
      }
    } else {
      req.flash("inactive", "Restricted to only supervisors");
      res.redirect(`/admin/dashboard/${user.role}/${_id}`);
    }
  }
);
// edit user post route
router.post(
  "/:role/:_id/editUser/:userId",
  ensureAuthenticated,
  async (req, res) => {
    const { role, _id, userId } = req.params;
    const user = await User.findOne({ _id: _id });

    try {
      await User.updateOne(
        { _id: userId },
        { $set: { status: req.body.status, role: req.body.userRole } }
      );
      req.flash("inactive", "User updated");
      res.redirect(`/admin/dashboard/${user.role}/${_id}`);
    } catch (error) {
      console.log(error);
    }
  }
);

router.post(
  "/:role/:_id/deleteUser/:userId",
  ensureAuthenticated,
  async (req, res) => {
    let { role, _id, userId } = req.params;
    let error = [];

    const user = await User.findOne({ role: role, _id: _id });
    const _user = await User.findOne({ _id: userId });

    if (role === "supervisor" && _user.role !== "supervisor") {
      await User.updateOne({ _id: userId }, { $set: { status: "inactive" } });

      req.flash("deleteUserSuccess", "You deactivated the user successfully");
      res.redirect(`/admin/dashboard/${role}/${_id}`);
    } else {
      req.flash(
        "deleteUserError",
        "You cannot perform this action on the user"
      );

      res.redirect(`/admin/dashboard/${role}/${_id}`);
    }
  }
);

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) throw err;
  });
  res.redirect("/");
});
module.exports = router;
