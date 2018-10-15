//environment vars
require('dotenv').config();

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const { db } = require('./models');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

//upload images packages
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

// defining routes
const homeRoutes = require('./routes/home.js');
const loginRoutes = require('./routes/login.js');
const logoutRoutes = require('./routes/logout.js');
const signupRoutes = require('./routes/signup.js');
const userRoutes = require('./routes/user.js');
const dogRoutes = require('./routes/dog.js');
const notFoundRoutes = require('./routes/404.js');

//get the static files
app.use(express.static('public'));
//set ejs
app.set('view engine', 'ejs');
//bodyparser
app.use(bodyParser.urlencoded({ extended: false }));

// instantiating new s3 client
const s3 = new aws.S3({ apiVersion: '2006-03-01' });

//define session
app.use(
  session({
    store: new SequelizeStore({
      db: db,
      checkExpirationInterval: 15 * 60 * 1000, // The interval at which to cleanup expired sessions in milliseconds.
      expiration: 24 * 60 * 60 * 1000, // The maximum age (in milliseconds) of a valid session.
    }),
    secret: process.env.BCRYPT_SECRET,
    saveUninitialized: true,
    resave: false,
  })
);

// Routes
app.use('/', homeRoutes);
app.use('/login', loginRoutes);
app.use('/logout', logoutRoutes);
app.use('/signup', signupRoutes);
app.use('/user', userRoutes);
app.use('/dog', dogRoutes);
app.use('*', notFoundRoutes);

db.sync({ force: true })
  .then(() => {
    const server = app.listen(3000, () => {
      console.log(`App listening on port: ${server.address().port}`);
    });
  })
  .catch(error => console.log('This error occured', error));
