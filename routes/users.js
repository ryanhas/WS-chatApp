const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
// Load User model
const User = require("../models/User");
const { forwardAuthenticated } = require("../config/auth");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: "AOL",
  auth: {
    user: process.env.AOL_USER,
    pass: process.env.AOL_PASS,
  },
});

// Login Page
router.get("/login", forwardAuthenticated, (req, res) => res.render("login"));

// Register Page
router.get("/register", forwardAuthenticated, (req, res) =>
  res.render("register")
);

// Register
router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    User.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({ msg: "Email already exists" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                // send confirmation email
                console.log(`New user id: ${user._id}`);
                jwt.sign(
                  { _id: user._id },
                  process.env.EMAIL_SECRET,
                  { expiresIn: "1d" }, async (err, emailToken) => {
                    const url = `http://localhost:1337/users/confirm/${emailToken}`;

                    try {
                      await transporter.sendMail({
                        to: email,
                        subject: "Confirm Email",
                        html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`,
                      });
                      req.flash(
                        "success_msg",
                        "Account created successfully. Please click the link sent via email"
                      );
                      res.redirect("/users/login");
                    } catch (err) {
                      console.log(`user email: ${user.email}`)
                      // await required to make sure user is deleted when error
                      await User.deleteOne({email: user.email})
                      console.log("Error creating account");
                      console.error(err);
                      req.flash(
                        "error_msg",
                        "An error occurred when creating the account"
                      );
                      res.redirect("/users/register");
                    }
                  }
                );
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
  //req.session.userEmail = req.user.email
});

// Logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});

// Confirm new user
router.get("/confirm/:token", (req, res) => {
  try {
    const id = jwt.verify(req.params.token, process.env.EMAIL_SECRET);
    User.findById(id.user, (err, user) => {
      console.log("User found");
      user.confirmed = true;
      user.save();
    });
    res.redirect("/");
  } catch (e) {
    res.send("error");
  }
});

module.exports = router;
