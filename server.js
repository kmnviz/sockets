const { WebSocketServer } = require('ws');
const port = 7369;
const host = '127.0.0.1';

const server = new WebSocketServer({ port, host });
const clients = [];

server.on('connection', (socket) => {
    const id = Math.floor(Math.random(0, 10) * 1000);
    clients.push({ id, socket });

    socket.on('close', () => {
        console.log(`Client ${id} closed connection`);
        const index = clients.findIndex((client) => { return client.id === id });
        clients.splice(index, 1);
    });

    socket.on('end', () => {
        console.log(`Client ${id} ended connection`);
    });

    socket.on('error', (error) => {
        console.error(`Client ${id} received error: ${error}`);
        socket.terminate();
        console.log(`Connection of client ${id} was terminated`);
    });

    socket.on('message', (message) => {
        const sender = clients.find((client) => client.socket === socket);
        clients.forEach((client) => {
            client.socket.send(`${sender.id}:${message}`);
        });
    });

    console.log(`Client ${id} connected`);
});



console.log(`server listens on 127.0.0.1:7369`);
