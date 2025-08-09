const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load User model
const Puser = require('../models/Puser');

module.exports = function(ppassport) {
  ppassport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user
      Puser.findOne({
        email: email
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );

  ppassport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  ppassport.deserializeUser(function(id, done) {
    Puser.findById(id, function(err, user) {
      done(err, user);
    });
  });
};