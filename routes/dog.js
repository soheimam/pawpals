const express = require('express');
const router = express.Router();
const { User, Dog } = require('../models');
//requiring json data for select dropdowns
const dogBreeds = require('../data/json/breeds.json');
//upload images packages
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
// instantiating new s3 client
const s3 = new aws.S3({ apiVersion: '2006-03-01' });

// upload file
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.BUCKET_NAME,
    //we are defining the name of the object that will be stored in s3
    // we need to wrap the key value in a callback function, because.. req.body does not exist
    // at this point in time, since we are not even in a route.. req.body comes from forms.
    // the function on key will run as part of the middleware on whichever route we add this too.
    // Thus, req will be populated and the key will have the right value
    key: function(req, file, cb) {
      // https://www.npmjs.com/package/multer-s3
      cb(null, `${req.body.name}_${req.body.breed}.png`);
    },
    metadata: function(req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    acl: 'public-read', // Make the image uploaded available to the world to view
  }),
});

const getDogProfile = (req, res) => {
  const userSession = req.session.user;
  const dogId = req.params.id;
  Dog.findAll({
    where: {
      id: dogId,
    },
  }).then(dog => {
    if (!dog.length) {
      res.status(400);
      res.render('404', { error: 'This dog does not exist' });
    } else {
      const dogData = dog[0];
      res.render('dog-profile', { dog: dogData, user: userSession || {} });
    }
  });
};

const newDogGET = (req, res) => {
  const breeds = dogBreeds.dogs;
  res.render('create-dog-profile', { breeds });
};

const newDogPOST = (req, res) => {
  const url = req.file.location;
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
        imageUrl: url,
      });
    })
    .then(dog => {
      res.redirect(`/dog/${dog.id}`);
    })
    .catch(err => {
      console.log(err);
    });
};

const editDogGET = (req, res) => {
  const breeds = dogBreeds.dogs;
  const dogId = req.params.id;
  res.render('edit-dog-profile', { breeds, dogId });
};

const editDog = (req, res) => {
  const dogId = req.params.id;
  Dog.update(
    {
      name: req.body.name,
      breed: req.body.breed,
      age: req.body.age,
      gender: req.body.gender,
      description: req.body.description,
    },
    {
      where: {
        id: dogId,
      },
    }
  ).then(() => {
    res.redirect(`/dog/${dogId}`);
  });
};

const deleteDog = (req, res) => {
  const userSession = req.session.user;
  const dogId = req.params.id;

  Dog.destroy({
    where: {
      id: dogId,
    },
  }).then(dog => {
    res.redirect(
      `/user/${userSession.id}?message=${encodeURIComponent(
        'Dog was successfully deleted'
      )}`
    );
  });
};

module.exports = router
  .get('/new', newDogGET)
  .post('/new', upload.single('file-upload'), newDogPOST)
  .get('/:id', getDogProfile)
  .get('/:id/edit', editDogGET)
  .post('/:id/edit', editDog)
  .post('/:id/delete', deleteDog);
