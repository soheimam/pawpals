const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

//requiring json data for select dropdowns
const nlRegions = require('../data/json/nlregions.json');

module.exports = User => {
  const get = (req, res) => {
    const regions = nlRegions.regions;
    const message = req.query.message;
    res.render('signup', { regions, message });
  };

  const post = (req, res) => {
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
  };

  return router.get('/', get).post('/', post);
};
