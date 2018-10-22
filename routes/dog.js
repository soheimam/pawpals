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
const rekognition = new aws.Rekognition({apiVersion: '2016-06-27', region: 'eu-west-1'});

// upload file
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.BUCKET_NAME,
    // we are defining the name of the object that will be stored in s3
    // we need to wrap the key value in a callback function, because.. req.body does not exist
    // at this point in time, since we are not even in a route.. req.body comes from forms.
    // the function on key will run as part of the middleware on whichever route we add this too.
    // Thus, req will be populated and the key will have the right value
    key: function(req, file, cb) {
      // https://www.npmjs.com/package/multer-s3
      cb(null, `${req.body.name}_${req.body.breed}_${Date.now()}.png`);
    },
    metadata: function(req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    acl: 'public-read', // Make the image uploaded available to the world to view
  }),
});

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
      return
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

  // Parameters required for AWS Rekognition
  const params = {
    Image: {
     S3Object: {
      Bucket: process.env.BUCKET_NAME, 
      Name: req.file.key
     }
    },
    MinConfidence: 70
   };

   // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Rekognition.html#detectLabels-property
   rekognition.detectLabels(params, (err, data) => {
    if(err) throw err;
    console.log(data)
    const dogInImage = data.Labels.filter(label => label.Name === 'Dog')
    console.log(dogInImage)
    if (dogInImage.length === 0) {
      res.status(400);
      res.render('404', { error: 'There was no Dog found in the uploaded image, please try again.' });
      return
    }
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
          imageUrl: url,
        });
      })
      .then(dog => {
        res.redirect(`/dog/${dog.id}`);
      })
      .catch(err => {
        console.log(err);
      });
  })
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

const editDogPOST = (req, res) => {
  const dogId = req.params.id;

  let url = req.file ? req.file.location : req.body.url;
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
  .post('/new', upload.single('file-upload'), newDogPOST)
  .get('/:id', getDogProfile)
  .get('/:id/edit', editDogGET)
  .post('/:id/edit', upload.single('file-upload'), editDogPOST)
  .post('/:id/delete', deleteDog);
