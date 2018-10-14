module.exports = (sequelize, type) => {
  return sequelize.define(
    'users',
    {
      firstname: {
        type: type.STRING,
      },
      lastname: {
        type: type.STRING,
      },
      email: {
        type: type.STRING,
        unique: true,
      },
      password: {
        type: type.STRING,
        unique: true,
      },
      phone: {
        type: type.STRING,
      },
      region: {
        type: type.STRING,
      },
    },

    {
      timestamps: false,
    }
  );
};
