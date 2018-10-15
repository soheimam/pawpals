const Sequelize = require('sequelize');
const userModel = require('./user.js');
const dogModel = require('./dog.js');

//environment vars
require('dotenv').config();

//db config
const db = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  host: process.env.DB_HOST,
  dialect: 'postgres',
  storage: './session.postgres',
});

// Declare Models
const User = userModel(db, Sequelize);
const Dog = dogModel(db, Sequelize);

// Establish relations
User.hasMany(Dog);
Dog.belongsTo(User);

module.exports = {
  db,
  User,
  Dog,
};
