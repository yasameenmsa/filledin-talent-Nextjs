import mongoose from 'mongoose';

const CVSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email',
        ],
    },
    fileUrl: {
        type: String,
        required: [true, 'Please provide a file URL'],
    },
    language: {
        type: String,
        required: [true, 'Please provide a language'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.CV || mongoose.model('CV', CVSchema);
