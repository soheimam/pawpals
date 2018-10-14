const Sequelize = require('sequelize');

module.exports = sequelize => {
  return sequelize.define(
    'users',
    {
      firstname: {
        type: Sequelize.STRING,
      },
      lastname: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        unique: true,
      },
      phone: {
        type: Sequelize.STRING,
      },
      region: {
        type: Sequelize.STRING,
      },
    },

    {
      timestamps: false,
    }
  );
};
