import mongoose, { Schema } from "mongoose";
const WishlistSchema = new Schema (
    {
      userId:{type:Schema.Types.ObjectId,ref:"User",unique:true},
      courses:[{type:Schema.Types.ObjectId,ref:"Course"}],
    },
    {timestamps:true},
);

export default mongoose.model("WishlistSchema",WishlistSchema)