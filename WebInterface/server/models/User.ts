import * as crypto from "crypto";
import * as mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: String,
  picture: String,
  name: String,
  given_name: String,
  family_name: String,
}, { timestamps: true });

// export const User: UserType = mongoose.model<UserType>('User', userSchema);
const User = mongoose.model("User", userSchema);
export default User;
