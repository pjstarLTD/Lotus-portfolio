import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: String,
  phone: {
    type: String,
  },
  message: String,
  details: String,
  status: {
    type: String,
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Lead = mongoose.models.Lead || mongoose.model("Lead", leadSchema);

export default Lead;