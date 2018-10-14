const express = require('express');
const router = express.Router();

//render landingpage
module.exports = () => {
  const get = (req, res) => {
    const error = req.query.error || 'Page not found';
    res.render('404', { error });
  };
  return router.get('/', get);
};
