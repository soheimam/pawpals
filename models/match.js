module.exports = (sequelize, type) => {
  return sequelize.define(
    'matches',
    {
      userThatLiked: {
        type: type.STRING,
      },
      likedDog: {
        type: type.STRING,
      },
      likedDogOwner: {
        type: type.STRING,
      },
      accepted: {
        type: type.BOOLEAN,
      },
    },

    {
      timestamps: false,
    }
  );
};
