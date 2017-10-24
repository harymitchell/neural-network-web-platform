import * as mongoose from "mongoose";

const feedSchema = new mongoose.Schema({
    comments: [{ id: String, text: String }],
    id: String,
    name: String,
    text: String,
}, { timestamps: true });

// export const Feed: FeedType = mongoose.model<FeedType>('Feed', feedSchema);
const Feed = mongoose.model("Feed", feedSchema);
export default Feed;