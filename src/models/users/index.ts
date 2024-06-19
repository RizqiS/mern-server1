import mongoose, { Document, Schema, Types } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import { IPlace } from "../places";

export interface IUser extends Document {
  name: string;
  password: string;
  email: string;
  image: string;
  place: Types.ObjectId[];
  created_at: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  image: { type: String, required: true },
  place: [{ type: Schema.Types.ObjectId, ref: "places", required: true }],
  created_at: { type: Date, default: Date.now },
});

mongoose.plugin(uniqueValidator);
export default mongoose.model<IUser>("users", userSchema);
