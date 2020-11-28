require("dotenv").config();

const mongoose = require("mongoose");

const workflowSchema = mongoose.Schema({
  vendor_id: {
    type: String,
    required: [true, "The vendor field is required."]
  },
  user_id: {
    type: String,
    required: [true, "The user field is required."]
  },
  type_of_approval: {
    type: String,
    required: [true, "The type_of_approval field is required."]
  },
  approval_action: {
    type: String,
    required: [true, "The approval_action field is required!"]
  },
  workflow_status: { 
    type: String, 
    required: [true, "The workflow_status field is required!"]
  },
  created_at: { 
    type: Date,
    default: Date.now
  }
});
 
const Workflow = mongoose.model("workflow_log", workflowSchema);
module.exports = { Workflow }