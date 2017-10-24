import * as mongoose from "mongoose";

const datasetSchema = new mongoose.Schema({
    name: String,
    data: [],
    hasHeaders: Boolean,
    delimiter: String,
    columnSpec: {
    },
    user: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

datasetSchema.methods.dataSelection = function (count: number, startIndex: number) {
    let start = startIndex - 1;
    if (start < 0){
        start = 0;
    }
    return this.data.slice(start, start + count);
};

// export const Dataset: DatasetType = mongoose.model<DatasetType>('Dataset', datasetSchema);
const Dataset = mongoose.model("Dataset", datasetSchema);
export { Dataset};
