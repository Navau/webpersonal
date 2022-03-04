const Course = require("../models/course");

function addCourse(req, res) {
  const body = req.body;
  const course = new Course(body);
  course.order = 1000;

  course.save((err, courseStored) => {
    if (err) {
      res.status(500).send({
        code: 500,
        message: "Error al crear el curso.",
        err,
      });
    } else {
      if (!courseStored) {
        res
          .status(400)
          .send(
            { code: 400, message: "No se ha podido crear el curso." },
            courseStored
          );
      } else {
        res.status(200).send({
          code: 200,
          message: "Curso creado correctamente.",
          courseStored,
        });
      }
    }
  });
}

function getCourses(req, res) {
  Course.find()
    .sort({ order: "asc" })
    .exec((err, coursesStored) => {
      if (err) {
        res
          .status(500)
          .send({ code: 500, message: "Error del servidor.", err });
      } else {
        if (!coursesStored) {
          res.status(404).send({
            code: 404,
            message: "No se ha encontrado ningun curso.",
            coursesStored,
          });
        } else {
          res.status(200).send({
            code: 200,
            message: "Cursos obtenidos exitosamente.",
            coursesStored,
          });
        }
      }
    });
}

function deleteCourse(req, res) {
  const { id } = req.params;

  Course.findByIdAndRemove(id, (err, courseDeleted) => {
    if (err) {
      res.status(500).send({ code: 500, message: "Error del servidor.", err });
    } else {
      if (!courseDeleted) {
        res
          .status(404)
          .send({ code: 404, message: "Curso no encontrado.", courseDeleted });
      } else {
        res.status(200).send({
          code: 200,
          message: "Curso eliminado correctamente.",
          courseDeleted,
        });
      }
    }
  });
}

function updateCourse(req, res) {
  const courseData = req.body;
  const id = req.params.id;

  Course.findByIdAndUpdate(id, courseData, (err, courseUpdate) => {
    if (err) {
      res.status(500).send({ code: 500, message: "Error del servidor.", err });
    } else {
      if (!courseUpdate) {
        res.status(404).send({
          code: 404,
          message: "No se ha encontrado ningún curso.",
          courseUpdate,
        });
      } else {
        res.status(200).send({
          code: 200,
          message: "El curso se ha actualizado correctamente.",
          courseUpdate,
        });
      }
    }
  });
}

module.exports = {
  addCourse,
  getCourses,
  deleteCourse,
  updateCourse,
};
