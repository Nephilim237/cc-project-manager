import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
    },
}, {timestamps: true});

export const Message = mongoose.model("Message", MessageSchema);