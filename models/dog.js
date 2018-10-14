module.exports = (sequelize, type) => {
  return sequelize.define(
    'dogs',
    {
      name: {
        type: type.STRING,
      },
      breed: {
        type: type.STRING,
      },
      age: {
        type: type.STRING,
      },
      gender: {
        type: type.STRING,
      },
      description: {
        type: type.TEXT,
      },
    },
    {
      timestamps: false,
    }
  );
};
