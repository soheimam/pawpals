const Sequelize = require('sequelize');

module.exports = sequelize => {
  return sequelize.define(
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
    },
    {
      timestamps: false,
    }
  );
};
