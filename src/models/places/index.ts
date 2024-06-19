import mongoose, { Document, Schema, Types } from "mongoose";
// import { IUser } from "../users";

export interface IPlace extends Document {
  title: string;
  description: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  image: string;
  creator: Types.ObjectId;
  created_At: Date;
}

const placeSchema = new Schema<IPlace>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  image: { type: String, required: true },
  creator: { type: Schema.Types.ObjectId, required: true, ref: "users" },
  created_At: { type: Date, default: Date.now },
});

export default mongoose.model<IPlace>("places", placeSchema);
