const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const Datastore = require('nedb')
const LocalStrategy = require('passport-local').Strategy;



// Create Users database 
const users = new Datastore({
  filename: './database/users.db',
  autoload: true
})

// Login Page
router.get('/login', (req, res) => res.render('login'));

// Register Page
router.get('/register', (req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let err = [];
  //checking required fields 
  if (!name || !email || !password || !password2) {
    err.push({ msg: 'Please Fill all fields' });
  }
  //checking password match 
  if (password !== password2) {
    err.push({ msg: 'Password do not match' });
  }
  // checking pass length 
  if (password.length < 6) {
    err.push({ msg: 'Password should be at least 6 characters ' })
  }
  if (err.length > 0) {
    res.render('register', {
      err,
      name,
      email,
      password,
      password2
    })
  } else {
    // validation pass 
    users.findOne({ email: email }, async function (error, doc) {


      if (doc) {
        err.push({ msg: 'This email already exists ' })
        res.render('register', {
          err,
          name,
          email,
          password,
        })


      } else {
        // create new user and hashpassword
        const hashedpassword = await bcrypt.hash(password, 10)
        const newUser = {
          name,
          email,
          password: hashedpassword,
          date: new Date
        }
        users.insert(newUser, (doc, error) => {
          if (doc) {
            console.log(doc)
          }
          req.flash('success_msg', 'Registration Successful. Please Login ');
          res.redirect('/users/login');
        })
      }
    })
  }
});
/// need to compare hashed pass and if exist : 
// Login handle 
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true

  })(req, res, next);
})

passport.use(
  new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    // Match user
    // nedb version

    users.findOne({ email: email }, async (error, doc) => {
      if (doc) {
        if (await bcrypt.compare(password, doc.password)) {
          return done(null, doc);

        }
        else {
          return done(null, false, {
            message: "Password Incorrect "
          })
        }
      }
      else {
        return done(null, false, { message: 'This email address is not registered ' })
      }
    })

    passport.serializeUser(function (user, done) {
      done(null, user);
    });

    passport.deserializeUser(function (user, done) {
      done(null, user);
    });

  }

  )
)
















// Logout
router.get('/logout', (req, res) => {
  req.logOut();
  req.flash('success_msg', 'you successfully logged out');
  res.redirect('/users/login')
});

module.exports = router;
