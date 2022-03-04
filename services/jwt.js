const jwt = require("jwt-simple");
const moment = require("moment");

const SECRET_KEY = "g7T8YUxd45s6w987g4eXDDDsqwerPutoxd123456CualquierHuevadaxd";

exports.createAccessToken = function (user) {
  //FUNCTION PARA CREAR EL ACCESS TOKEN

  const payload = {
    id: user._id,
    name: user.name,
    lastname: user.lastname,
    email: user.email,
    role: user.role,
    createToken: moment().unix(),
    exp: moment().add(3, "hours").unix(),
  };

  return jwt.encode(payload, SECRET_KEY);
};

exports.createRefreshToken = function (user) {
  //FUNCTION PARA CREAR EL REFRESH ACCES TOKEN
  const payload = {
    id: user._id,
    exp: moment().add(30, "days").unix(),
  };

  return jwt.encode(payload, SECRET_KEY);
};

exports.decodedToken = function (token) {
  return jwt.decode(token, SECRET_KEY, true);
};
