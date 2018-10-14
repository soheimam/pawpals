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
app.use('/dog', dogRoutes);

sequelize
  .sync({ force: true })
  .then(() => {
    const server = app.listen(3000, () => {
      console.log('App listening on port: ' + server.address().port);
    });
  })
  .catch(error => console.log('This error occured', error));

app.get('/profile/:id', (req, res) => {
  const userSessionData = req.session.user;
  const userSessionId = req.session.user.id;
  const id = req.params.id;
  models.User.findAll({
    where: {
      id: id,
    },
  }).then(user => {
    if (!user.length) {
      res.redirect(
        '/404?error=' + encodeURIComponent('That profile does not exist')
      );
    } else {
      models.Dog.findAll({
        where: {
          userId: userSessionId,
        },
      }).then(dogs => {
        res.render('profile', { userSessionData, dogs });
      });
    }
  });
});

//render landingpage
app.get('/', (req, res) => {
  res.render('index');
});

//render 404
app.get('/404', (req, res) => {
  const error = req.query.error;
  res.render('404', { error });
});
