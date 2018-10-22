const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User, Dog, Match, Conversation } = require('../models');

//create a new user from the signup form
const newUserPOST = (req, res) => {
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
      `/signup?message=${encodeURIComponent('All fields are required')}`
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
          `/signup?message=${encodeURIComponent(
            'An account with that email is already registered'
          )}`
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
      res.redirect(`/user/${user.id}`);
    })
    .catch(err => {
      console.log(err);
    });
};

const getUserProfile = (req, res) => {
  const userSessionData = req.session.user || {};
  const userSessionId = req.session.user.id;
  const id = req.params.id;
  const message = req.query.message;
  User.findAll({
    where: {
      id: id,
    },
    include: [
      {
        model: Match,
        where: {
          status: 'pending',
        },
        required: false,
        include: [{ model: Dog }],
      },
      { model: Conversation },
    ],
  }).then(user => {
    const matchRequest = user[0].matches;

    if (!user.length) {
      res.status(400);
      res.render('404', { error: 'This user does not exist' });
    } else {
      Dog.findAll({
        where: {
          userId: userSessionId,
        },
      }).then(dogs => {
        res.render('profile', {
          userSession: userSessionData,
          dogs: dogs,
          message,
          matchRequest,
        });
      });
    }
  });
};

module.exports = router.post('/new', newUserPOST).get('/:id', getUserProfile);
