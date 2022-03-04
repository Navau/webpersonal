const express = require("express");
const UserController = require("../controllers/user");
const multipart = require("connect-multiparty");

const md_auth = require("../middleware/authenticated"); //MIDDLEWARE PARA QUE NO CUALQUIERA USE UNA PETICION AL SERVIDOR
const md_upload_avatar = multipart({ uploadDir: "./uploads/avatar" }); //MIDDLEWARE PARA SUBIR ARCHIVOS A UNA CARPETA

const api = express.Router();

api.post("/sign-up", UserController.signUp);
api.post("/sign-in", UserController.signIn);
api.get("/users", [md_auth.ensureAuth], UserController.getUsers);
api.get("/users-active", [md_auth.ensureAuth], UserController.getUsersActive);
api.put(
  "/upload-avatar/:id",
  [md_auth.ensureAuth, md_upload_avatar], //2 MIDDLEWARES, 1 PARA VERIFICAR AL USUARIO SI ESTA LOGEADO Y OTRO PARA LA SUBIDA DE ARCHIVOS
  UserController.uploadAvatar
);
api.get("/get-avatar/:avatarName", UserController.getAvatar);
api.put("/update-user/:id", [md_auth.ensureAuth], UserController.updateUser);
api.put("/active-user/:id", [md_auth.ensureAuth], UserController.activeUser);
api.delete("/delete-user/:id", [md_auth.ensureAuth], UserController.deleteUser);
api.post("/sign-up-admin", [md_auth.ensureAuth], UserController.signUpAdmin);

module.exports = api;
