const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname)));

wss.on("connection", (socket) => {
    console.log("WebSocket conectado.");

    socket.on("message", (message) => {
        for (const client of wss.clients) {
            if (
                client !== socket &&
                client.readyState === WebSocket.OPEN
            ) {
                client.send(message.toString());
            }
        }
    });

    socket.on("close", () => {
        console.log("WebSocket desconectado.");
    });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});