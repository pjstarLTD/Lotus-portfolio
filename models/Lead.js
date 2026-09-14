import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    whatsapp: { type: String, required: true },
    phone: { type: String },
    message: { type: String },
    details: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema);