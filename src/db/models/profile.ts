import { Schema, model, Types } from 'mongoose'

const schema = new Schema({
    appName: {type: String, required: true},
    nickName: {type: String, required: true},
    directLink: {type: String,default: ''},
    age: {type: String, required: true},
    gender: {type: String, required: true},
    orientation: {type: String, required: true},
    type: {type: String, required: true},
    premium: {type: Boolean,default: false},
    premiumReceivedDate: {type: Date},
    profilePostDate: {type: Date},
    about: {type: String,required: true},
    hotPoints: {type: String,default: '0'},
    views: {type: String,default: '0'},
    likes: {type: String,default: '0'},
    isOnline: {type: Boolean, default: false},
    likeHistory: [{
        userId: String,
        blockTime: Number,
        isBlocked: {type: Boolean,default: false},
    }],
    disLikes: {type: String,default: '0'},
    disLikesHistory: [{
        userId: String,
        blockTime: Number,
        isBlocked: {type: Boolean,default: false},
    }],
    commentNumber: {type: String,default: '0'},
    reports: {type: String,default: '0'},
    photos:[{type: Types.ObjectId, ref: 'Photo'}],
    acceptProfileTerms: {type: String, required: true},
    countryFullName: {type: String, required: true},
    city: {type: String, default: null},
    latitude: {type: String, default: null},
    longitude: {type: String, default: null},
    countryShortName: {type: String, required: true},
    adminComment: {type: String, required: false},
    owner: {type: Types.ObjectId, ref: 'User'}
})

export default model('Profile', schema)