const jwt = require("jwt-simple");
const moment = require("moment");

const SECRET_KEY = "g7T8YUxd45s6w987g4eXDDDsqwerPutoxd123456CualquierHuevadaxd";

exports.ensureAuth = (req, res, next) => {
  if (!req.headers.authorization) {
    //VERIFICAMOS SI LA PETICION TIENE UNA AUTORIZACION, PARA TENER SEGURIDAD DE QUE NO SE ESTA ENVIANDO DESDE CUALQUIER LUGAR QUE NO SEA EL FRONTEND
    return res
      .status(403)
      .send({ message: "La petición no tiene cabecera de autenticación." });
  }
  const token = req.headers.authorization.replace(/['"]+/g, ""); //LIMPIA EL TOKEN QUE LLEGA EN HEADERS

  try {
    var payload = jwt.decode(token, SECRET_KEY); //DECODIFICAMOS LOS DATOS Y NOS DEVUELBE UN OBJETO

    if (payload.exp <= moment().unix()) {
      //VERIFICAMOS SI EL TOKEN HA EXPIRADO
      return res.status(404).send({ message: "El token ha expirado." });
    }
  } catch (err) {
    console.log(err);

    return res.status(404).send({ message: "Token Inválido." });
  }

  req.user = payload; //RECARGAMOS LA PETICION Y ACTUALIZAMOS USER PARA ENVIARSELO RECIEN AL GET EN User.js de ROUTERS
  next(); //DAMOS PASO A QUE SE EJECUTE EL ENDPOINT Y DECIMOS QUE EL MIDDLEWARE ES CORRECTO
};
