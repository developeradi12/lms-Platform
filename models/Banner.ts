import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBanner extends Document {
  image: string;
  isMobile:boolean
}

const BannerSchema = new Schema<IBanner>(
  {
    image: { type: String, required: true },
    isMobile:{type:Boolean,default:false}
  },
  { timestamps: true }
);

const Banner: Model<IBanner> =
  mongoose.models.Banner || mongoose.model<IBanner>("Banner", BannerSchema);

export default Banner;