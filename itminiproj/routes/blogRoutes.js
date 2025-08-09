const express = require('express');
const Blog = require('../models/blog');
const router = express.Router();
const blogController = require('../controllers/blogController');

router.get('/patients', blogController.blog_index);//changed /blogs to /patients

router.post('/patients', blogController.blog_create_post);//changed /blogs to /patients

router.get('/patients/create', blogController.blog_create_get);

router.get('/patients/:id', blogController.blog_details);

router.delete('/patients/:id', blogController.blog_delete);



module.exports = router;