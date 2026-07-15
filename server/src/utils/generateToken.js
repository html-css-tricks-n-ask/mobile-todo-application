const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecurejwtsecret12345!', {
    expiresIn: '24h',
  });
};

module.exports = generateToken;
