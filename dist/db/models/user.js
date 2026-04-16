import { Schema, model, Types } from 'mongoose';
const schema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    terms: { type: String, required: true },
    registrationDate: { type: Date, required: true },
    profileSlots: { type: Number, default: 2, required: true },
    account_type: {
        type: String,
        enum: ['test', 'real'],
        default: 'real',
        required: false
    },
    status: {
        type: String,
        enum: ['Pending', 'Active'],
        default: 'Pending'
    },
    confirmationEmailCode: {
        type: String,
        unique: true
    },
    recoveryEmailCode: {
        type: String,
        unique: true
    },
    adminComment: { type: String, required: false },
    profiles: [{ type: Types.ObjectId, ref: 'Profile' }],
    ipList: [{ type: String }],
    fingerPrints: [{ type: String }],
    restrictions: [{ type: Types.ObjectId, ref: 'Restrictions' }],
});
export default model('User', schema);
