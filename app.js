const express = require("express");
const Joi = require("joi");
const app = express();
const morgan = require("morgan");
const config = require("config");
const debug = require("debug")("app:inicio");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

//configuración entornos
console.log("Aplicación: " + config.get("nombre"));
console.log("BD Server: " + config.get("configDB.host"));

if (app.get("env") === "development") {
  app.use(morgan("tiny"));
  debug("doing lots of uninteresting work");
}

debug("Conectando a la base de datos");

const usuarios = [
  { id: 1, nombre: "Luis" },
  { id: 2, nombre: "Rodrigo" },
  { id: 3, nombre: "Ramses" },
  { id: 4, nombre: "Lili" },
];

const schema = Joi.object({
  nombre: Joi.string().min(3).required(),
});

app.get("/", (req, res) => {
  res.send("Hola Mundo desde Express.");
});

app.get("/api/usuarios", (req, res) => {
  res.send(usuarios);
});

app.get("/api/usuarios/:id", (req, res) => {
  if (Existe(req.params.id)) {
    res.send(Existe(req.params.id));
  } else {
    res.status(404).send("Usuario no encontrado");
  }
});

app.post("/api/usuarios", (req, res) => {
  const { error, value } = schema.validate({ nombre: req.body.nombre });
  if (!error) {
    const usuario = {
      id: usuarios.length + 1,
      nombre: value.nombre,
    };
    usuarios.push(usuario);
    res.send(usuario);
  } else {
    const mensaje = error.details[0].message;

    res.status(400).send(mensaje);
  }
});

app.put("/api/usuarios/:id", (req, res) => {
  if (Existe(req.params.id)) {
    const { error, value } = schema.validate({
      nombre: req.body.nombre,
    });
    if (error) {
      const mensaje = error.details[0].message;

      res.status(400).send(mensaje);
      return;
    }
    let usuario = Existe(req.params.id);
    usuario.nombre = req.body.nombre;
    res.send(usuario);
  } else {
    res.status(404).send("Usuario no encontrado");
    return;
  }
});

app.delete("/api/usuarios/:id", (req, res) => {
  let usuario = usuarios.find((u) => u.id === parseInt(req.params.id));
  if (!usuario) {
    res.status(404).send("El usuario no fue encontrado");
    return;
  }
  const index = usuarios.indexOf(usuario);
  usuarios.splice(index, 1);
  res.send(usuario);
});

function Existe(id) {
  if (!usuarios.find((u) => u.id === parseInt(id))) {
    return false;
  } else {
    return usuarios.find((u) => u.id === parseInt(id));
  }
}

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Escuchando en el puerto ${port}..`);
});
