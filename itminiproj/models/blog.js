const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    dname: {
        type: String,
        required: true
    },
    snippet: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    med: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    }
}, { timestamps: true });

const profileSchema = new Schema({
    input : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true
    },
    first : {
        type: String,
        required: true
    },
    last : {
        type: String,
        required: true
    },
    address : {
        type: String,
        required: true
    },
    city : {
        type: String,
        required: true
    },
    country : {
        type: String,
        required: true
    },
    postal : {
        type: String,
        required: true
    },
    me : {
        type: String,
        required : true
    }
})



const Blog = mongoose.model('Blog', blogSchema);

const Profile = mongoose.model('Profile', profileSchema);

module.exports = { Blog:Blog, Profile:Profile };

//module.exports = Profile;