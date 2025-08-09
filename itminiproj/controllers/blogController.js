//blog_index, blog_details, blog_create_get, blog_create_post, blog_delete
const Models = require('../models/blog');


const blog_index = (req, res) => {
    Models.Blog.find().sort({ createdAt: -1 })
        .then((result) => {
            res.render('index', { title: 'All Patients', blogs: result })
        })
        .catch((err) => {
            console.log(err);
        })
}

const blog_details = (req, res) => {
    const id = req.params.id;
    Models.Blog.findById(id)
        .then((result) => {
            res.render('details', { blog: result, title: 'Patient details' })
        })
        .catch((err) => {
            console.log(err);
        })
}

const blog_create_get = (req, res) => {
    res.render('create', { title: 'Add Patient' });
}

const blog_create_post = (req, res) => {
    const blog = new Models.Blog(req.body);

    blog.save()
        .then((result) => {
            res.redirect('/patients');
        })
        .catch((err) => {
            console.log(err);
        })
}


const blog_delete = (req, res) => {
    const id = req.params.id;
    Models.Blog.findByIdAndDelete(id)
        .then((result) => {
            res.json({ redirect: '/patients' })
        })
        .catch((err) => {
            console.log(err);
        })
}

module.exports = {
    blog_index,
    blog_details,
    blog_create_get,
    blog_create_post,
    blog_delete
}