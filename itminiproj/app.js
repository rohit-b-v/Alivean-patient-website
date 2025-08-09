//Express Server
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { result } = require('lodash');
const blogRoutes = require('./routes/blogRoutes');
const Models = require('./models/blog');
const User = require('./models/User');
const Puser = require('./models/Puser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
//const ppassport=require('ppassport');
const flash = require('connect-flash');
const session = require('express-session');
const { forwardAuthenticated } = require('./config/auth');
const { pforwardAuthenticated } = require('./config/pauth');
const bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
//const Profile = require('./models/blog');

//express app
const app = express();

//Connect to MongoDB
const dbURI = 'mongodb+srv://root123:root123@nodetuts.lkrdn.mongodb.net/node-tuts?retryWrites=true&w=majority';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((results) => app.listen(3000))
    .catch((err) => console.log(err))


//register view engine as ejs
app.set('view engine', 'ejs');


//middleware and static files
app.use(express.static('public'));
app.use((morgan('dev')));
app.use(express.urlencoded({ extended: true }));

// Passport Config
require('./config/passport.js')(passport);
//require('./config/ppassport.js')(passport);

// Express session
app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
    })
  );
  
  // Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Connect flash
  app.use(flash());
  
  // Global variables
  app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
  });


//Routing
app.get('/shome', (req, res) => {
    res.render('Showcase');
})
app.get('/sabout', (req, res) => {
    res.render('Showcaseabout', { title: 'About' })
})
app.get('/scontact', (req, res) => {
    res.render('Showcasecontact', { title: 'scontact' })
})
app.get('/sservices', (req, res) => {
    res.render('Showcaseservices', { title: 'sservice' })
})
app.get('/', (req, res) => {
    res.redirect('/patients');
});

app.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});

//Update routing
app.get('/patients/edit/:id', (req, res) => {
    const id = req.params.id;
    Models.Blog.findById(id)
        .then((result) => {
            res.render('edit', { title: 'Edit patient', blog: result });
        })
        .catch(err => {
            console.log(err);
        })
})

app.post('/patients/edit/:id', (req, res) => {
    let blog = {};
    blog.title = req.body.title;
    blog.dname = req.body.dname;
    blog.snippet = req.body.snippet;
    blog.link = req.body.link;
    blog.med = req.body.med;
    blog.body = req.body.body;
    let query = { _id: req.params.id };
    Models.Blog.update(query, blog)
        .then((result) => {
            res.redirect('/patients');
        })
        .catch((err) => {
            console.log(err);
        })
})

//Search bar handling
app.post('/patients/searchresults',(req,res) => {
    var searchbar = req.body.searchbar;
    console.log(searchbar);
    Models.Blog.find({title : searchbar})
    .then((result) => {
        res.render('search',{blogs:result , title:'Search results'});
    })
    .catch(err => {
        console.log(err);
    })
})


//profile routing
app.get('/doctor/profile',(req,res) => {
    Models.Profile.find()
    .then((result) => {
        res.render('profile',{title:'Profile',datas:result});
    })
    .catch((err) => {
        console.log(err);
    })
})

app.post('/doctor/profile', (req, res) => {
    let blog = {};
    blog.input = req.body.input;
    blog.email = req.body.email;
    blog.first = req.body.first;
    blog.last = req.body.last;
    blog.address = req.body.address;
    blog.city = req.body.city;
    blog.country = req.body.country;
    blog.postal = req.body.postal;
    blog.me = req.body.me;
    let query = { _id: '5fbce95d3637f61c245d61dc' };
    Models.Profile.update(query, blog)
        .then((result) => {
            res.redirect('/patients');
        })
        .catch((err) => {
            console.log(err);
        })
})
/*app.post('/doctor/profile',(req,res) => {
    const profile = new Models.Profile(req.body);

    profile.save()
    .then((result) => {
        res.redirect('/')
    })
    .catch((err) => {
        console.log(err);
    })
})*/

//Login and register for doctor

// Login Page
app.get('/login', forwardAuthenticated, (req, res) => res.render('login'));


// Register Page
app.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
app.post('/register', (req, res) => {
  const { dname, email, hname, hbranch, hcity, expertise, password, password2 } = req.body;
  let errors = [];

  if (!dname || !email ||  !hname || !hbranch || !hcity || !expertise || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      dname,
      email,
      hname,
      hbranch,
      hcity,
      expertise,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
            errors,
            dname,
            email,
            hname,
            hbranch,
            hcity,
            expertise,
            password,
            password2
        });
      } else {
        const newUser = new User({
            dname,
            email,
            hname,
            hbranch,
            hcity,
            expertise,
            password,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
app.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
app.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/login');
});

//Login and register for patient

// Login Page
app.get('/plogin', pforwardAuthenticated, (req, res) => res.render('plogin'));


// Register Page
app.get('/pregister', pforwardAuthenticated, (req, res) => res.render('pregister'));

// Register
app.post('/pregister', (req, res) => {
  const { name, email, bloodgrp, phno, address, city, state, postalcode, allergies, password, password2 } = req.body;
  let errors = [];

  if (!name || !email ||  !bloodgrp || !phno || !address || !city || !state || !postalcode || !allergies || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('pregister', {
      errors,
      name,
      email,
      bloodgrp,
      phno,
      address,
      city,
      state,
      postalcode,
      allergies,
      password,
      password2
    });
  } else {
    Puser.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('pregister', {
            errors,
            name,
            email,
            bloodgrp,
            phno,
            address,
            city,
            state,
            postalcode,
            allergies,
            password,
            password2
        });
      } else {
        const newUser = new Puser({
            name,
            email,
            bloodgrp,
            phno,
            address,
            city,
            state,
            postalcode,
            allergies,
            password,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/plogin');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
app.post('/plogin', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/Home',
    failureRedirect: '/plogin',
    failureFlash: true
  })(req, res, next);
});

// Logout
app.get('/plogout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/plogin');
});

//Mayur routes
app.get('/Home',(req,res) => {
    res.render('Home',{title:'Home', blogs:res});
});

app.get('/pabout', (req,res) => {
    res.render('pAbout',{title:'About'});
})

//Searching database from Home
app.post('/search_doctors',urlencodedParser,function(req,res){
    var hospital = req.body.hospital;
    var place = req.body.place;
    if(place == "")
    {
        doctors.find({hName : {$regex:hospital,$options:"$xi"}},function(err,data){
        if(err) throw err;
        console.log('Found!');
        console.log(data);
        res.render('Search_result',{title:'',data:data});
    }).sort({hBranch: 1});
    }
    doctors.find({hName : {$regex:hospital,$options:"$xi"},hBranch : {$regex:place,$options:"$xi"}},function(err,data){
        if(err) throw err;
        console.log('Found!');
        console.log(data);
        res.render('Search_result',{title:'',data:data});
    });
});

//Profile
app.get('/pprofile',function(req,res){
    Puser.find(function(err,data){
        if(err) throw err;
        console.log('Found!');
        console.log(data);
        res.render('Pprofile',{title:'User profile',datas:data});
    });
    
});

//Profile Update
app.post('/profile_update',urlencodedParser,function(req,res){
    console.log(req.body);
    Puser.update((req.body.username,req.body),function(err,data){
        if(err) throw err;
        console.log('Updated');
        console.log(data);
    });
    Puser.find({username : req.body.username},function(err,data){
        if(err) throw err;
        console.log('Found!');
        console.log(data);
        res.render('Profile',{title:'User profile',datas:data});
    });
});

//History
app.get('/history',(req,res) => {
    res.render('History',{title:'History'});
});


//patient-routes
app.use(blogRoutes);

//404 page
app.use((req, res) => {
    res.status(404).render('404', { title: 'error' });
})





