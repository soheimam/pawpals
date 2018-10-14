const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models');

const get = (req, res) => {
  const message = req.query.message;
  res.render('login', { message });
};

const post = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  //email and password is needed

  if (!email) {
    res.redirect(
      `/login?message=${encodeURIComponent(
        'Please fill out your email address.'
      )}`
    );
  }
  if (!password) {
    res.redirect(
      `/login?message=${encodeURIComponent('Please fill out your password.')}`
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
              `/login?message=${encodeURIComponent('Invalid password')}`
            );
          }
        });
      } else {
        //if user does not exist, send a message
        res.redirect(
          `/login?message=${encodeURIComponent('User does not exist')}`
        );
      }
    })
    .catch(error => {
      console.error(error);
    });
};

module.exports = router.get('/', get).post('/', post);
