const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();

const server = http.createServer(app);

const wss = new WebSocket.Server({
    server
});

let camera = null;
let painel = null;


wss.on("connection", socket => {

    console.log("Cliente conectado.");


    socket.on("message", message => {

        let dados;

        try {
            dados = JSON.parse(message.toString());
        } catch {
            return;
        }


        if (dados.tipo === "camera") {

            camera = socket;

            console.log("Câmera conectada.");

            if (
                painel &&
                painel.readyState === WebSocket.OPEN
            ) {

                painel.send(JSON.stringify({
                    tipo: "camera-pronta"
                }));
            }
        }


        if (dados.tipo === "painel") {

            painel = socket;

            console.log("Painel conectado.");

            if (
                camera &&
                camera.readyState === WebSocket.OPEN
            ) {

                camera.send(JSON.stringify({
                    tipo: "painel-pronto"
                }));
            }
        }


        if (dados.tipo === "oferta") {

            if (
                painel &&
                painel.readyState === WebSocket.OPEN
            ) {

                painel.send(
                    JSON.stringify(dados)
                );
            }
        }


        if (dados.tipo === "resposta") {

            if (
                camera &&
                camera.readyState === WebSocket.OPEN
            ) {

                camera.send(
                    JSON.stringify(dados)
                );
            }
        }


        if (dados.tipo === "candidato") {

            if (
                socket === camera &&
                painel &&
                painel.readyState === WebSocket.OPEN
            ) {

                painel.send(
                    JSON.stringify(dados)
                );
            }


            if (
                socket === painel &&
                camera &&
                camera.readyState === WebSocket.OPEN
            ) {

                camera.send(
                    JSON.stringify(dados)
                );
            }
        }


        if (dados.tipo === "encerrar") {

            if (
                camera &&
                camera.readyState === WebSocket.OPEN
            ) {

                camera.send(JSON.stringify({
                    tipo: "encerrar"
                }));
            }
        }

    });


    socket.on("close", () => {

        if (socket === camera) {
            camera = null;
            console.log("Câmera desconectada.");
        }

        if (socket === painel) {
            painel = null;
            console.log("Painel desconectado.");
        }

    });

});


const PORT = process.env.PORT || 8080;


server.listen(PORT, "0.0.0.0", () => {

    console.log(
        `Servidor rodando na porta ${PORT}`
    );

});
