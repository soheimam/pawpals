const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const Sequelize = require('sequelize');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const bcrypt = require('bcrypt');

//get the css files
app.use(express.static('public'));

//set ejs
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));

require('dotenv').config();
//db config
const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  host: process.env.DB_HOST,
  dialect: 'postgres',
  storage: './session.postgres',
});

app.use(
  session({
    store: new SequelizeStore({
      db: sequelize,
      checkExpirationInterval: 15 * 60 * 1000, // The interval at which to cleanup expired sessions in milliseconds.
      expiration: 24 * 60 * 60 * 1000, // The maximum age (in milliseconds) of a valid session.
    }),
    secret: 'this is secret',
    saveUninitialized: true,
    resave: false,
  })
);

//defining the User model
const User = sequelize.define(
  'users',
  {
    firstname: {
      type: Sequelize.STRING,
    },
    lastname: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
      unique: true,
    },
    phone: {
      type: Sequelize.STRING,
    },
    country: {
      type: Sequelize.STRING,
    },
  },

  {
    timestamps: false,
  }
);

//defining the User model
const Dog = sequelize.define(
  'dogs',
  {
    name: {
      type: Sequelize.STRING,
    },
    breed: {
      type: Sequelize.STRING,
    },
    age: {
      type: Sequelize.STRING,
    },
    gender: {
      type: Sequelize.STRING,
      unique: true,
    },
    description: {
      type: Sequelize.TEXT,
    },
  },
  {
    timestamps: false,
  }
);

User.hasMany(Dog);
Dog.belongsTo(User);

app.get('/login', (req, res) => {
  res.render('login');
});

//signup route
app.get('/signup', (req, res) => {
  res.render('signup');
});

//post request signup
app.post('/signup', (req, res) => {
  //all fields are required
  if (
    !req.body.fname ||
    !req.body.lname ||
    !req.body.email ||
    !req.body.password ||
    !req.body.phone ||
    !req.body.country
  ) {
    res.redirect(
      '/signup?error=' + encodeURIComponent('All fields are required')
    );
  }
  //find a user with that username
  User.findOne({
    where: {
      email: req.body.email,
    },
  })
    .then(user => {
      //if mail is already taken, then send an error
      if (user) {
        return res.redirect(
          '/signup?error=' +
            encodeURIComponent(
              'An account with that email is already registered'
            )
        );
      }
    })
    .catch(err => {
      console.log(err);
    });

  const password = req.body.password;
  bcrypt
    .hash(password, 8)
    .then(hash => {
      return User.create({
        //populate the user table using an encrypted password
        firstname: req.body.fname,
        lastname: req.body.lname,
        email: req.body.email,
        password: hash,
        phone: req.body.phone,
        country: req.body.country,
      });
    })
    .then(user => {
      req.session.user = user;
      res.redirect('/profile');
    })
    .catch(err => {
      console.log(err);
    });
});

//post request login
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  //email and password is needed

  if (!email) {
    res.redirect(
      '/login?message=' +
        encodeURIComponent('Please fill out your email address.')
    );
  }
  if (!password) {
    res.redirect(
      '/login?message=' + encodeURIComponent('Please fill out your password.')
    );
  }

  //find the user with the email from the req
  User.findOne({
    where: {
      email: email,
    },
  })
    .then(user => {
      if (user) {
        bcrypt.compare(password, user.password).then(isValidPassword => {
          if (isValidPassword) {
            req.session.user = user;
            res.redirect('/profile');
          } else {
            //if the password is incorrect, send a message
            res.redirect(
              '/login?message=' + encodeURIComponent('Invalid  password.')
            );
          }
        });
      } else {
        //if user does not exist, send a message
        res.redirect(
          '/login?message=' + encodeURIComponent('User does not exist')
        );
      }
    })
    .catch(error => {
      console.error(error);
    });
});

//logout route
app.get('/logout', (req, res) => {
  req.session.destroy(error => {
    if (error) {
      throw error;
    }
    res.redirect('/?message=' + encodeURIComponent('You are logged out.'));
  });
});

app.get('/create-dog-profile', (req, res) => {
  res.render('dog-profile-form');
});

app.post('/create-dog-profile', (req, res) => {
  const userEmail = req.session.user.email;

  User.findOne({
    where: {
      email: userEmail,
    },
  })
    .then(user => {
      //populate dog table with user relation
      return user.createDog({
        name: req.body.name,
        breed: req.body.breed,
        age: req.body.age,
        gender: req.body.gender,
        description: req.body.description,
      });
    })
    .then(post => {
      res.redirect(`/profile`);
    })
    .catch(err => {
      console.log(err);
    });
});

app.get('/profile:username', (req, res) => {
  const userData = req.session.user;
  const username = req.params.username;
  Dog.findAll({
    where: {
      userId: userData.id,
    },
  }).then(dogs => {
    console.log(dogs);
    res.render('profile', { userData });
  });
});

sequelize
  .sync()
  .then(() => {
    const server = app.listen(3000, () => {
      console.log('App listening on port: ' + server.address().port);
    });
  })
  .catch(error => console.log('This error occured', error));
