import { Schema, model, Types } from 'mongoose';
const schema = new Schema({
    imgAlt: { type: String },
    height: { type: Number },
    width: { type: Number },
    mainPhoto: { type: Boolean, default: false },
    imgLink: { type: String, required: true },
    hotPoints: { type: Number, default: 0 },
    uploadDate: { type: String },
    uploadDateOriginal: { type: Date },
    hotPointsHistory: [{
            userId: String,
            blockTime: Number,
            isBlocked: { type: Boolean, default: false },
        }],
    commentNumber: { type: Number, default: 0 },
    adminComment: { type: String, required: false },
    owner: { type: Types.ObjectId, ref: 'Profile' }
});
export default model('Photo', schema);
