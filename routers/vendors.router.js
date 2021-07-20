const express    = require("express");
const router     = express.Router();
const { User }   = require("../models/users-model");
const { Vendor } = require("../models/vendors.model");

module.exports = (auth) => {
  router.post("/create", auth, function (req, res) {
    const vendorData = {
      vendor_name:           req.body.vendor_name,
      sequential_approvers:  req.body.sequential_approvers,
      round_robin_approvers: req.body.round_robin_approvers,
      any_one_approvers:     req.body.any_one_approvers
    };
    (async () => {
      try {
        const vendor = new Vendor(vendorData);
        await vendor.save((err, doc) => {
          if (err) {
            res.status(422).json({ error: true, message: "The request was well-formed but was unable to be followed due to semantic errors." }).end();
          } else {
            const data = { 
              vendor_name:           doc.vendor_name, 
              sequential_approvers:  doc.sequential_approvers, 
              round_robin_approvers: doc.round_robin_approvers, 
              any_one_approvers:     doc.any_one_approvers, 
              created_at:            doc.created_at 
            };
            res.status(201).json({ error: false, message: "The request has succeeded and a new resource has been created as a result.", data: data }).end();
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
        await Vendor.find().sort( { created_at: -1 }).exec((err, vendors) => {
          if (!vendors) {
            res.status(422).json({ error: true, message: "The request was well-formed but was unable to be followed due to semantic errors." }).end();
          } else {
            res.status(200).json({ error: false, data: vendors }).end();
          }
        });
      } catch (error) {
        console.log(error);
        res.status(500).send({error: true, message: "Something went wrong. Please, try after a little bit.."}).end();
      }
    })();
  });

  router.put("/:vendor_id", auth, function (req, res) {
    const vendor_id = req.params.vendor_id;
    (async () => {
      try {
        Vendor.updateOne({ _id: vendor_id }, { $set: { workflow_status: req.body.workflow_status } }, (err, vendor) => {
          if (!vendor) {
            res.status(422).json({ error: true, message: "The request was well-formed but was unable to be followed due to semantic errors." }).end();
          } else {
            res.status(200).json({ error: false, message: "Workflow status updated." }).end();
          }
        });
      } catch (error) {
        console.log(error);
        res.status(500).send({error: true, message: "Something went wrong. Please, try after a little bit.."}).end();
      }
    })();
  });

  router.get("/:vendor_id", auth, function (req, res) {
    const vendor_id = req.params.vendor_id;

    try {
      Vendor.findOne({ _id: vendor_id }, (err, vendor) => {
        if (!vendor) {
          res.status(422).json({ error: true, message: "The request was well-formed but was unable to be followed due to semantic errors." }).end();
        } else {
          (async () => {
            let vendorData = {
              _id: vendor._id,
              vendor_name: vendor.vendor_name,
              sequential_approvers: [],
              round_robin_approvers: [],
              any_one_approvers: [],
              workflow_status: vendor.workflow_status,
              created_at: vendor.created_at
            }
            let sequential_approvers  = vendor.sequential_approvers.split(",");
            let round_robin_approvers = vendor.round_robin_approvers.split(",");
            let any_one_approvers     = vendor.any_one_approvers.split(",");
            let users = sequential_approvers.concat(round_robin_approvers);
            users = users.concat(any_one_approvers);
            
            await User.find({ "_id": users }, { _id: 1, full_name: 1 }, (err, users) => {
              if (!users) res.status(500).send({error: true, message: "Something went wrong. Please, try after a little bit.."}).end();
              
              const fetchedUsers = users.map((user) => {
                return {
                  _id: user._id.toString(),
                  full_name: user.full_name
                }
              });
              
              vendorData.sequential_approvers = fetchedUsers.filter((user) => {
                return sequential_approvers.indexOf(user._id) >= 0;
              });
              
              vendorData.round_robin_approvers = fetchedUsers.filter((user) => {
                return round_robin_approvers.indexOf(user._id) >= 0;
              });
              
              vendorData.any_one_approvers = fetchedUsers.filter((user) => {
                return any_one_approvers.indexOf(user._id) >= 0;
              });
            });
  
            res.status(200).json({ error: false, data: vendorData }).end();
          })();
        }
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({error: true, message: "Something went wrong. Please, try after a little bit.."}).end();
    }
  });

  return router;
}