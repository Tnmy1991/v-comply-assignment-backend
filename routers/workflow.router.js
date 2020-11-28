const express      = require("express");
const router       = express.Router();
const { Workflow } = require("../models/workflow.model");

module.exports = (auth) => {
  router.post("/entry", auth, function (req, res) {
    const logData = {
      vendor_id:        req.body.vendor_id,
      user_id:          req.body.user_id,
      type_of_approval: req.body.type_of_approval,
      approval_action:  req.body.approval_action,
      workflow_status:  req.body.workflow_status
    };
    (async () => {
      try {
        const workflow = new Workflow(logData);
        await workflow.save((err, doc) => {
          if (err) {
            res.status(422).json({ error: true, message: "The request was well-formed but was unable to be followed due to semantic errors." }).end();
          } else {
            const data = { 
              vendor_id:        doc.vendor_id,
              user_id:          doc.user_id,
              type_of_approval: doc.type_of_approval,
              approval_action:  doc.approval_action,
              workflow_status:  doc.workflow_status,
              created_at:       doc.created_at 
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

  router.get("/status/:vendor_id", auth, function (req, res) {
    const vendor_id = req.params.vendor_id;

    (async () => {
      try {
        await Workflow.find({ vendor_id: vendor_id }).sort( { created_at: 1 }).exec((err, logs) => {
          if (!logs) {
            res.status(422).json({ error: true, message: "The request was well-formed but was unable to be followed due to semantic errors." }).end();
          } else {
            res.status(200).json({ error: false, data: logs }).end();
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