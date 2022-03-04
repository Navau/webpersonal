const mongoose = require("mongoose");
const app = require("./app");
const PORT_SERVER = process.env.PORT || 3977;

const { API_VERSION, IP_SERVER, PORT_DB } = require("./config");

// `mongodb://${IP_SERVER}:${PORT_DB}/josemanuel`,
mongoose.connect(
  `mongodb+srv://navau:mern1234@webpersonalcursobd.cfca0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err, res) => {
    if (err) {
      throw err;
    } else {
      console.log("La conexion a la base de datos es correcta.", res);

      app.listen(PORT_SERVER, () => {
        console.log("#####################");
        console.log("###### API_REST #####");
        console.log("#####################");
        console.log(`http://${IP_SERVER}:${PORT_SERVER}/api/${API_VERSION}`);
      });
    }
  }
);
