import * as mongoose from "mongoose";

const modelSchema = new mongoose.Schema({
    name: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    dataset: { type: mongoose.Schema.Types.ObjectId, ref: "Dataset" },
    modelType: String,
    trainTestSplit: Number,
    inputColumns: [String],
    outputColumns: [String],
    layers: [{
        layerType: String, // eg Activation or Dense
        arguments: {} // varies per type, dynamic
    }],
    optimizer: String,
    loss: String,
    metrics: String,
    sample_weight_mode: String,
    weighted_metrics: String,
    epochs: Number,
    batch_size: Number,
    cross_validation: {
        validator: String, // NONE, StratifiedKFold, KFold
        n_splits: Number,
        shuffle: Boolean,
    },
    one_hot_encode_output: Boolean,
    estimators: [
        {
            name: String
        },
    ],
    evaluations: [{type: mongoose.Schema.Types.ObjectId, ref: "Evaluation"}],
    isHistorical: Boolean,
    deployRequested: Boolean,
    deployID: String,
    pathToHDF5: Object,
    serviceURL: String,
}, { timestamps: true });

const Model = mongoose.model("Model", modelSchema);
export { Model };
