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
const homeRoutes = require('./routes/home.js');
const loginRoutes = require('./routes/login.js');
const logoutRoutes = require('./routes/logout.js');
const signupRoutes = require('./routes/signup.js');
const userRoutes = require('./routes/user.js');
const dogRoutes = require('./routes/dog.js');
const notFoundRoutes = require('./routes/404.js');

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
app.use('/', homeRoutes());
app.use('/login', loginRoutes(models.User));
app.use('/logout', logoutRoutes());
app.use('/signup', signupRoutes(models.User));
app.use('/user', userRoutes(models.User, models.Dog));
app.use('/dog', dogRoutes(models.User, models.Dog));
app.use('*', notFoundRoutes());

sequelize
  .sync()
  .then(() => {
    const server = app.listen(3000, () => {
      console.log(`App listening on port: ${server.address().port}`);
    });
  })
  .catch(error => console.log('This error occured', error));
