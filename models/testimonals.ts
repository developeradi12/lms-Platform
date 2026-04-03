import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITestimonial extends Document {
  name: string;
  role?: string;
  message: string;
  image?: string;
  rating?: number;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    name:    { type: String, required: true, trim: true },
    role:    { type: String, trim: true },
    message: { type: String, required: true, trim: true },
    image:   { type: String },
    rating:  { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);

const Testimonial: Model<ITestimonial> =
  mongoose.models.Testimonial ||
  mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);

export default Testimonial;