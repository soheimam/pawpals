const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const Sequelize = require('sequelize');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

//environment vars
require('dotenv').config();
//get the static files
app.use(express.static('public'));
//set ejs
app.set('view engine', 'ejs');
//bodyparser
app.use(bodyParser.urlencoded({ extended: false }));

//assigning the module exports from models/index to a const
const defineModels = require('./models/index.js');

//defining routes
const getLoginRoutes = require('./routes/login.js');
const getLogoutRoutes = require('./routes/logout.js');
const getSignupRoutes = require('./routes/signup.js');
const getUserRoutes = require('./routes/user.js');
const getDogRoutes = require('./routes/dog.js');

//db config
const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  host: process.env.DB_HOST,
  dialect: 'postgres',
  storage: './session.postgres',
});

// Define DB Models
const models = defineModels(sequelize);

// Get Route Data
const loginRoutes = getLoginRoutes(models.User);
const logoutRoutes = getLogoutRoutes();
const signupRoutes = getSignupRoutes(models.User);
const userRoutes = getUserRoutes(models.User, models.Dog);
const dogRoutes = getDogRoutes(models.User, models.Dog);

//define sessions
app.use(
  session({
    store: new SequelizeStore({
      db: sequelize,
      checkExpirationInterval: 15 * 60 * 1000, // The interval at which to cleanup expired sessions in milliseconds.
      expiration: 24 * 60 * 60 * 1000, // The maximum age (in milliseconds) of a valid session.
    }),
    secret: process.env.BCRYPT_SECRET,
    saveUninitialized: true,
    resave: false,
  })
);

// Routes
app.use('/login', loginRoutes);
app.use('/logout', logoutRoutes);
app.use('/signup', signupRoutes);
app.use('/user', userRoutes);
app.use('/dog', dogRoutes);

sequelize
  .sync()
  .then(() => {
    const server = app.listen(3000, () => {
      console.log('App listening on port: ' + server.address().port);
    });
  })
  .catch(error => console.log('This error occured', error));

//render landingpage
app.get('/', (req, res) => {
  res.render('index');
});

//render 404
app.get('/404', (req, res) => {
  const error = req.query.error;
  res.render('404', { error });
});
