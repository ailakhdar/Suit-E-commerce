const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const app = express();
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
app.use(express.static('assets'));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express body parser
app.use(express.urlencoded({ extended: true }));
// express - session 
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}))
// passport middleware 
app.use(passport.initialize());
app.use(passport.session());

// connect flahs , 
app.use(flash())
// global vars for alert messages 
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));


const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
