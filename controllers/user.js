const bcrypt = require("bcrypt");
const jwt = require("../services/jwt");
const User = require("../models/user");

const fs = require("fs"); //FILE SYSTEM
const path = require("path"); //PATH

const saltRounds = 10;

function signUp(req, res) {
  const user = new User();

  const { name, lastname, email, password, repeatPassword } = req.body;
  user.name = name ? name : "Sin Nombre";
  user.lastname = lastname ? lastname : "Sin Apellidos";
  user.email = email.toLowerCase();
  user.role = "reviewer";
  user.active = false;

  if (!password || !repeatPassword) {
    res.status(404).send({ message: "Las contraseñas son obligatorias." });
  } else {
    if (password !== repeatPassword) {
      res.status(404).send({ message: "Las contraseñas no son iguales." });
    } else {
      // bcrypt.genSalt(saltRounds, function (err, salt) {
      //   bcrypt.hash(myPlaintextPassword, salt, function (err, hash) {

      //   });
      // });
      bcrypt.hash(password, saltRounds, function (err, hash) {
        if (err) {
          res
            .status(500)
            .send({ message: "Error al encriptar la contraseña." });
        } else {
          user.password = hash;

          user.save((err, userStored) => {
            if (err) {
              res.status(500).send({ message: "El usuario ya existe." });
            } else {
              if (!userStored) {
                res.status(404).send({ message: "Error al crear el usuario." });
              } else {
                res.status(200).send({
                  message: "Usuario creado correctamente.",
                  user: userStored,
                });
              }
            }
          });
        }
      });
    }
  }
}

function signIn(req, res) {
  const params = req.body;
  const email = params.email.toLowerCase();
  const password = params.password;

  User.findOne({ email }, (err, userStored) => {
    //PARA ENCONTRAR UN USUARIO METODO "findOne"
    if (err) {
      res.status(500).send({ message: "Error del Servidor." });
    } else {
      if (!userStored) {
        //USER STORED ALMACENA LA INFORMACION DEL USUARIO
        res.status(404).send({ message: "Usuario no encontrado." });
      } else {
        bcrypt.compare(password, userStored.password, (err, check) => {
          //COMPARANDO LA CONTRASEÑA RECIBIDA CON LA DE LA DE BASE DE DATOS ENCRIPTADA
          if (err) {
            res.status(500).send({ message: "Error del Servidor." });
          } else if (!check) {
            res.status(404).send({ message: "La contraseña es incorrecta." });
          } else {
            if (!userStored.active) {
              res
                .status(200)
                .send({ code: 200, message: "El usuario no se ha activado." });
            } else {
              res.status(200).send({
                // message: "El usuario es correcto",
                accessToken: jwt.createAccessToken(userStored),
                refreshToken: jwt.createRefreshToken(userStored),
              });
            }
          }
        });
      }
    }
  });
}

function getUsers(req, res) {
  User.find()
    .then((users) => {
      if (!users) {
        res
          .status(404)
          .send({ message: "No se ha encontrado ningun usuario." });
      } else {
        res.status(200).send({ users });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "Error del servidor: " + err });
    });
}

function getUsersActive(req, res) {
  const query = req.query; //OBTENEMOS LO QUE MANDAMOS EN LA PETICION

  User.find({
    active: query.active, //INDICAMOS QUE BUSQUE LOS USUARIOS QUE TENGAN EL VALOR DE ACTIVE EN TRUE O FALSE, en la URl se manda http://localhost:3977/api/v1/users-active?active=false o puede tener tambien el valor de true
  })
    .then((users) => {
      if (!users) {
        res
          .status(404)
          .send({ message: "No se ha encontrado ningun usuario." });
      } else {
        res.status(200).send({ users });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "Error del servidor: " + err });
    });
}

function uploadAvatar(req, res) {
  const params = req.params;

  User.findById({ _id: params.id }, (err, userData) => {
    if (err) {
      res.status(500).send({ message: "Error del servidor." });
    } else {
      if (!userData) {
        res
          .status(404)
          .send({ message: "No se ha encontrado ningun usuario." });
      } else {
        let user = userData;

        if (req.files) {
          let filePath = req.files.avatar.path; //avatar es el ID que se le da al objeto
          let fileSplit = filePath.split("\\"); //PARA SEPARAR EN UNA ARRAY LA CADENA DE FILEPATH
          let fileName = fileSplit[2];

          let extSplit = fileName.split(".");
          let fileExt = extSplit[1]; //EXTENSION DEL ARCHIVO

          if (fileExt !== "png" && fileExt !== "jpg") {
            res.status(400).send({
              message:
                "La extensión de la imagen no es válida. (Extensiones permitidas: .jpg y .png)",
            });
          } else {
            user.avatar = fileName;
            //User.findByIdAndUpdate sirve para buscar el usuario por ID y luego actualizar solo los valores que se le mandan no actualizara todo, solo los valores que se especifican en este caso solo se actualizara el avatar porque se especifica con user.avatar mas no la informacion de todo el usuario
            User.findByIdAndUpdate(
              { _id: params.id },
              user,
              (err, userResult) => {
                if (err) {
                  res.status(500).send({ message: "Error del servidor" });
                } else {
                  if (!userResult) {
                    res
                      .status(404)
                      .send({ message: "No se ha encontrado ningun usuario." });
                  } else {
                    res.status(200).send({
                      avatarName: fileName,
                    });
                  }
                }
              }
            );
          }
        }
      }
    }
  });
}

function getAvatar(req, res) {
  const avatarName = req.params.avatarName;
  const filePath = "./uploads/avatar/" + avatarName;

  // fs.access(filePath, fs.constants.R_OK, (err) => {
  //   if (err) {
  //     res.status(404).send({ message: "El avatar que buscas no existe." });
  //   } else {
  //     res.sendFile(path.resolve(filePath));
  //   }
  // });
  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.status(404).send({ message: "El avatar que buscas no existe." });
    } else {
      if (!stats.isFile()) {
        res
          .status(404)
          .send({ message: "El avatar que buscas no es un archivo." });
      } else {
        res.sendFile(path.resolve(filePath));
      }
    }
  });
}

async function updateUser(req, res) {
  var userData = req.body;

  userData.email = req.body.email.toLowerCase();

  if (userData.password) {
    await bcrypt
      .hash(userData.password, saltRounds)
      .then((hash) => {
        userData.password = hash;
      })
      .catch((err) => {
        res
          .status(500)
          .send({ message: "Error al encriptar la contraseña. " + err });
      });
  }

  const params = req.params;

  User.findByIdAndUpdate({ _id: params.id }, userData, (err, userUpdate) => {
    if (err) {
      res.status(500).send({ message: "Error del servidor" });
    } else {
      if (!userUpdate) {
        res
          .status(404)
          .send({ message: "No se ha encontrado ningun usuario." });
      } else {
        res.status(200).send({ message: "Usuario actualizado correctamente." });
      }
    }
  });
}

function activeUser(req, res) {
  const { id } = req.params;
  const { active } = req.body;

  User.findByIdAndUpdate({ _id: id }, { active }, (err, userStored) => {
    if (err) {
      res.status(500).send({ message: "Error del servidor." });
    } else {
      if (!userStored) {
        res.status(404).send({ message: "No se ha encontrado el usuario." });
      } else {
        if (active === true) {
          res.status(200).send({ message: "Usuario activado correctamente." });
        } else {
          res
            .status(200)
            .send({ message: "Usuario desactivado correctamente." });
        }
      }
    }
  });
}

function deleteUser(req, res) {
  const { id } = req.params;

  User.findByIdAndRemove(id, (err, userDeleted) => {
    if (err) {
      res.status(500).send({ message: "Error del servidor." });
    } else {
      if (!userDeleted) {
        res.status(400).send({ message: "El usuario no se ha encontrado." });
      } else {
        res.status(200).send({
          message: "El usuario ha sido eliminado correctamente.",
          user: userDeleted,
        });
      }
    }
  });
}

function signUpAdmin(req, res) {
  const user = new User();

  const { name, lastname, email, role, password } = req.body;

  user.name = name;
  user.lastname = lastname;
  user.email = email.toLowerCase();
  user.role = role;
  user.active = true;

  if (!password) {
    res.status(500).send({ message: "La contraseña es obligatoria." });
  } else {
    bcrypt
      .hash(password, saltRounds)
      .then((hash) => {
        user.password = hash;

        user.save((err, userStored) => {
          if (err) {
            res.status(500).send({ message: "El usuario ya existe." });
          } else {
            if (!userStored) {
              res.status(500).send({ message: "No se pudo crear al usuario." });
            } else {
              res.status(200).send({
                message: "Usuario creado correctamente.",
                user: userStored,
              });
            }
          }
        });
      })
      .catch((err) => {
        res
          .status(500)
          .send({ message: "La contraseña no se pudo encriptar." });
      });
  }
}

module.exports = {
  signUp,
  signIn,
  getUsers,
  getUsersActive,
  uploadAvatar,
  getAvatar,
  updateUser,
  activeUser,
  deleteUser,
  signUpAdmin,
};
