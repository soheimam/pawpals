require('dotenv').config();

const bodyParser = require('body-parser');
const aws = require('aws-sdk')
const express = require('express');
const app = express();
const multer = require('multer')
const multerS3 = require('multer-s3')
const session = require('express-session');
const Sequelize = require('sequelize');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const bcrypt = require('bcrypt');

//get the css files
app.use(express.static('public'));

// we instantiating new s3 client
const s3 = new aws.S3({apiVersion: '2006-03-01'})

//set ejs
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));

//requiring json data
const dogBreeds = require('./data/json/breeds.json');
const nlRegions = require('./data/json/nlregions.json');


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
    region: {
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
    },
    description: {
      type: Sequelize.TEXT,
    },
    imageUrl: {
      type: Sequelize.STRING,
    }
  },
  {
    timestamps: false,
  }
);

User.hasMany(Dog);
Dog.belongsTo(User);

app.get('/login', (req, res) => {
  const message = req.query.message;
  res.render('login', { message });
});

//signup route
app.get('/signup', (req, res) => {
  const regions = nlRegions.regions;
  const message = req.query.message;
  res.render('signup', { regions, message });
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
    !req.body.region
  ) {
    res.redirect(
      '/signup?message=' + encodeURIComponent('All fields are required')
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
          '/signup?message=' +
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
        region: req.body.region,
      });
    })
    .then(user => {
      req.session.user = user;
      res.redirect(`/profile/${user.id}`);
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
            res.redirect(`/profile/${user.id}`);
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

app.get('/profile/:id', (req, res) => {
  const userSessionData = req.session.user;
  const userSessionId = req.session.user.id;
  const id = req.params.id;
  User.findAll({
    where: {
      id: id,
    },
  }).then(user => {
    if (!user.length) {
      res.redirect(
        '/404?error=' + encodeURIComponent('That profile does not exist')
      );
    } else {
      Dog.findAll({
        where: {
          userId: userSessionId,
        },
      }).then(dogs => {
        res.render('profile', { userSessionData, dogs });
      });
    }
  });
});

app.get('/create-dog-profile', (req, res) => {
  const breeds = dogBreeds.dogs;
  res.render('create-dog-profile', { breeds });
});

// upload file
var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.BUCKET_NAME,
    //we are defining the name of the object that will be stored in s3
    // we need to wrap the key value in a callback function, because.. req.body does not exist
    // at this point in time, since we are not even in a route.. req.body comes from forms.
    // the function on key will run as part of the middleware on whichever route we add this too.
    // Thus, req will be populated and the key will have the right value
    key: function (req, file, cb) { // https://www.npmjs.com/package/multer-s3
      cb(null,`${req.body.name}_${req.body.breed}_${req.body.age}.png`)
    },
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    acl: 'public-read' // Make the image uploaded available to the world to view
  })
})

app.post('/create-dog-profile', upload.single('file-upload'), (req, res) => {
  console.log(req.file)
  const url = req.file.location
  const userEmail = req.session.user.email;
  const user = req.session.user;
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
        imageUrl: url
      });
    })
    .then(post => {
      res.redirect(`/profile/${user.id}`);
    })
    .catch(err => {
      console.log(err);
    });
});

//render each dog details
app.get('/dog-profile/:id', (req, res) => {
  const userSession = req.session.user;
  const dogId = req.params.id;
  Dog.findAll({
    where: {
      id: dogId,
    },
  }).then(dog => {
    const dogData = dog[0];
    res.render('dog-profile', { dog: dogData });
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

sequelize
  .sync()
  .then(() => {
    const server = app.listen(3000, () => {
      console.log('App listening on port: ' + server.address().port);
    });
  })
  .catch(error => console.log('This error occured', error));
