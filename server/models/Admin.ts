import * as mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  workerNodes: [String]
}, { timestamps: true });

const User = mongoose.model("admin", adminSchema);
export default User;
