import * as mongoose from "mongoose";

const evaluationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    model: { type: mongoose.Schema.Types.ObjectId, ref: "Model" },
    model_ref: {},
    status: String,
    parameters: {},
    history: {},
    metrics: {},
    worker: String,
}, { timestamps: true });

const Evaluation = mongoose.model("Evaluation", evaluationSchema);
export { Evaluation };
