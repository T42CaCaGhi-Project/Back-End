import { Types, SchemaTypes, Schema, model } from "mongoose";

export interface UserInterface {
  _id?: Types.ObjectId;
  email: string;
  password: string;
  preferiti: Types.ObjectId[];
  isAdm: boolean;
  isOrg: boolean;
  alias: string;
  img: Buffer;
}

const UserSchema = new Schema<UserInterface>({
  email: { type: String, required: true },
  password: { type: String, required: true },
  preferiti: [{ type: SchemaTypes.ObjectId, ref: "Event" }],
  isAdm: { type: Boolean, default: false },
  isOrg: { type: Boolean, default: false },
  alias: String,
  img: Buffer,
});

const User = model("User", UserSchema);
export { User };
