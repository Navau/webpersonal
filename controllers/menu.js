const Menu = require("../models/menu");

function addMenu(req, res) {
  const { title, url, order, active } = req.body;
  const menu = new Menu();

  menu.title = title;
  menu.url = url;
  menu.order = order;
  menu.active = active;

  menu.save((err, createMenu) => {
    if (err) {
      res.status(500).send({ message: "Error del servidor." });
    } else {
      if (!createMenu) {
        res.status(404).send({ message: "Error al crear el Menú." });
      } else {
        res.status(200).send({ message: "Menú creado correctamente." });
      }
    }
  });
}

function getMenus(req, res) {
  Menu.find()
    .sort({ order: "asc" })
    .exec((err, menuStored) => {
      if (err) {
        res.status(500).send({ message: "Error del servidor." });
      } else {
        if (!menuStored) {
          res.status(404).send({ message: "No se ha encontrado ningun menú." });
        } else {
          res.status(200).send({ menu: menuStored });
        }
      }
    });
}

function updateMenu(req, res) {
  let menuData = req.body;
  const params = req.params;

  Menu.findByIdAndUpdate(params.id, menuData, (err, menuUpdate) => {
    if (err) {
      res.status(500).send({ message: "Error del servidor" });
    } else {
      if (!menuUpdate) {
        res.status(404).send({ message: "No se ha encontrado ningún menú." });
      } else {
        res
          .status(200)
          .send({ message: "Menú actualizado correctamente.", menuUpdate });
      }
    }
  });
}

function activateMenu(req, res) {
  const { id } = req.params;
  const { active } = req.body;

  Menu.findByIdAndUpdate(id, { active }, (err, menuStored) => {
    if (err) {
      res.status(500).send({ message: "Error del servidor." });
    } else {
      if (!menuStored) {
        res.status(404).send({ message: "No se ha encontrado ningún menú" });
      } else {
        if (active === true) {
          res.status(200).send({ message: "Menú activado correctamente." });
        } else if (active === false) {
          res.status(200).send({ message: "Menú desactivado correctamente." });
        } else {
          res.status(500).send({
            message: "Hubo un error. No se ha actualizado ningún menú.",
          });
        }
      }
    }
  });
}

function deleteMenu(req, res) {
  const { id } = req.params;

  Menu.findByIdAndRemove(id, (err, menuDeleted) => {
    if (err) {
      res.status(500).send({ message: "Error del servidor." });
    } else {
      if (!menuDeleted) {
        res.status(404).send({ message: "El Menú no se ha encontrado." });
      } else {
        res.status(200).send({
          message: "El Menú ha sido eliminado correctamente.",
          menu: menuDeleted,
        });
      }
    }
  });
}

module.exports = {
  addMenu,
  getMenus,
  updateMenu,
  activateMenu,
  deleteMenu,
};
