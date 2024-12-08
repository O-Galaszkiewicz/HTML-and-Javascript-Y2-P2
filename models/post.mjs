import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    text: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now // Automatically set the creation date
    }
});

const Post = mongoose.model('Post', postSchema);

export default Post;
