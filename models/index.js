const userModel = require('./user.js');
const dogModel = require('./dog.js');

module.exports = sequelize => {
  // Declare Models
  const User = userModel(sequelize);
  const Dog = dogModel(sequelize);

  // Establish relations
  User.hasMany(Dog);
  Dog.belongsTo(User);

  return {
    User,
    Dog,
  };
};
