require("dotenv").config();
const express  = require("express");
const router   = express.Router();
const CryptoJS = require("crypto-js");
const jwt      = require("jsonwebtoken");
const { User } = require("../models/users-model");

module.exports = (auth) => {
  router.post("/login", function (req, res) {
    (async () => {
      try {
        User.findOne({ "username": req.body.username }, (err, user) => {
          if (!user) {
            res.status(200).json({ error: true, message: "Invalid username supplied." }).end();
          } else {
            const comparePassword = CryptoJS.MD5(req.body.password +  process.env.SECRET).toString();
            if (comparePassword !== user.password) {
              res.status(200).json({ error: true, message: "Invalid password supplied." }).end();
            } else {
              const data = { id: user._id, username: user.username, full_name: user.full_name, role: user.role };
              jwt.sign({ data: data }, process.env.JWT_KEY, { expiresIn: '2h' }, function(err, token) {
                if (err) res.status(200).json({ error: true, message: "Unable to generate auth token." }).end();
                
                res.status(200).json({ error: false, message: "You've successfully sign-in.", data: data, token: token }).end();
              });
            }
          }
        });
      } catch (error) {
        console.log(error);
        res.status(500).send({error: true, message: "Something went wrong. Please, try after a little bit.."}).end();
      }
    })();
  });

  router.post("/create", function (req, res) {
    const userData = {
      username:  req.body.username,
      full_name: req.body.full_name,
      password:  CryptoJS.MD5(req.body.password + process.env.SECRET).toString(),
      role:      req.body.role
    };

    (async () => {
      try {
        const user = new User(userData);
        await user.save((err, doc) => {
          if (err) {
            res.status(422).json({ error: true, message: "The request was well-formed but was unable to be followed due to semantic errors." }).end();
          } else {
            const data = { username: doc.username, full_name: doc.full_name, role: doc.role, created_at: doc.created_at };
            res.status(201).json({ error: false, message: "A new user added successfully.", data: data }).end();
          }
        });
      } catch (error) {
        console.log(error);
        res.status(500).send({error: true, message: "Something went wrong. Please, try after a little bit.."}).end();
      }
    })();
  });

  router.get("/list", auth, function (req, res) {
    (async () => {
      try {
        User.find(
          { "role": { $ne: "admin" } }, 
          { _id: 1, username: 1, full_name: 1, role: 1, created_at: -1 }, 
          ).sort( { created_at: 1 }).exec((err, users) => {
          if (!users) {
            res.status(422).json({ error: true, message: "The request was well-formed but was unable to be followed due to semantic errors." }).end();
          } else {
            res.status(200).json({ error: false, data: users }).end();
          }
        });
      } catch (error) {
        console.log(error);
        res.status(500).send({error: true, message: "Something went wrong. Please, try after a little bit.."}).end();
      }
    })();
  });

  return router;
}