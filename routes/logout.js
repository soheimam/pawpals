const express = require('express');
const router = express.Router();

module.exports = () => {
  const get = (req, res) => {
    req.session.destroy(error => {
      if (error) {
        throw error;
      }
      res.redirect('/?message=' + encodeURIComponent('You are logged out.'));
    });
  };

  return router.get('/', get);
};
