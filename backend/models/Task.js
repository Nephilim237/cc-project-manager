import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
	title: {
		type: String,
		required: [true, "Le titre est obligatoire"],
		trim: true,
		maxLentgh: [200, 'Le titre ne doit pas depasser 200 caracteres'],
	},
	description: {
		//La description est oprionnelle
		type: String,
		trim: true,
		default: '',
	},
	project: {
		// Relation entre une tache et le projet
		type: mongoose.Schema.Types.ObjectId,
		ref: "Project",
		required: true,
	},
	assignedTo: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		default: null,
		required: false, // Peut etre non assigne initialement
	},
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
    },
    status: {
        type: String,
        enum: ['to-do', 'in-progress', 'testing', 'done'],
        default: 'to-do',
    },
    dueDate: {
        type: Date,
        default: null,
    },
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},

}, {timestamps: true});

export const Task = mongoose.model('Task', TaskSchema);
