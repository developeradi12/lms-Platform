import mongoose, { Schema } from "mongoose";


const PaymentSchema = new Schema(
    {
      userId:{type:Schema.Types.ObjectId, ref:"User"},
      CourseId:{type:Schema.Types.ObjectId,ref:"Course"},
      PaymentStatus:{
        type:String,
        enum:["Pending","Success","Failed"],
      },
      PaymentId:{type:String},
    },{
        timestamps:true,
    },
)
export default mongoose.model("PaymentSchema",PaymentSchema);