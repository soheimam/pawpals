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
const multerConfig = {
  storage: multerS3({
    s3: s3,
    bucket: process.env.BUCKET_NAME,
    key: function(req, file, cb) {
      cb(null, `${req.body.name}_${req.body.breed}.png`);
    },
    metadata: function(req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    acl: 'public-read',
  }),
};
const uploadCreateDog = multer(multerConfig);
const uploadEditDog = multer(multerConfig);

const getDogProfile = (req, res) => {
  const userSession = req.session.user || {};
  const dogId = req.params.id;
  Dog.findAll({
    where: {
      id: dogId,
    },
    include: [
      {
        model: User,
      },
    ],
  }).then(dog => {
    if (!dog.length) {
      res.status(400);
      res.render('404', { error: 'This dog does not exist' });
    } else {
      const dogData = dog[0];
      res.render('dog-profile', {
        dog: dogData,
        user: userSession || {},
        userSession,
      });
    }
  });
};

const newDogGET = (req, res) => {
  const breeds = dogBreeds.dogs;
  const userSession = req.session.user || {};
  res.render('create-dog-profile', { breeds, userSession });
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
  Dog.findAll({
    where: {
      id: dogId,
    },
  }).then(dog => {
    const name = dog[0].name;
    const breed = dog[0].breed;
    const age = dog[0].age;
    const gender = dog[0].gender;
    const description = dog[0].description;
    const url = dog[0].imageUrl;
    const userSession = req.session.user || {};
    res.render('edit-dog-profile', {
      breeds,
      dogId,
      name,
      breed,
      age,
      gender,
      description,
      url,
      userSession,
    });
  });
};

const editDog = (req, res) => {
  const dogId = req.params.id;
  const url = req.file.location;
  Dog.update(
    {
      name: req.body.name,
      breed: req.body.breed,
      age: req.body.age,
      gender: req.body.gender,
      description: req.body.description,
      imageUrl: url,
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
  const userSession = req.session.user || {};
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
  .post('/new', uploadCreateDog.single('file-upload'), newDogPOST)
  .get('/:id', getDogProfile)
  .get('/:id/edit', editDogGET)
  .post('/:id/edit', uploadEditDog.single('file-upload'), editDog)
  .post('/:id/delete', deleteDog);
