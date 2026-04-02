import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		trim: true,
	},
	description: {
		type: String,
		trim: true,
	},
	owner: {
		// REference a celui qui a cree le projet
		type: mongoose.Schema.Types.ObjectId,
		ref: "User", // Pointe sur le model User
		required: true,
	},
	members: [
		// Liste des personnes participant au projet
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],
    dueDate: {
        type: Date,
        default: null,
    },
    status: {
        type: String,
        enum: ['Active', 'Completed', 'Archived'],
        default: 'Active',
    },
},
{
    timestamps: true,
});

export const Project = mongoose.model('Project', ProjectSchema);
