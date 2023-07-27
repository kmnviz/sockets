const { WebSocketServer } = require('ws');
const port = 7369;
const host = '127.0.0.1';
const capacity = 1000;

const server = new WebSocketServer({ port, host });
const rooms = {};

const defineCurrentClient = (socket) => {
    let currentClient;
    const roomsNames = Object.keys(rooms);
    for (let i = 0; i < roomsNames.length; i++) {
        currentClient = rooms[roomsNames[i]].clients.find((client) => client.socket === socket);
    }

    return currentClient;
}

const defineClientRoomName = (client) => {
    const roomsNames = Object.keys(rooms);
    for (let i = 0; i < roomsNames.length; i++) {
        if (rooms[roomsNames[i]].clients.find((roomClient) => roomClient.id === client.id )) {
            return roomsNames[i];
        }
    }
}

const removeClientFromRoom = (client, roomName) => {
    const clientIndex = rooms[roomName].clients.findIndex((roomClient) => roomClient.id === client.id);
    rooms[roomName].clients.splice(clientIndex, 1);
}

let clients = 0;
server.on('connection', (socket) => {
    if (clients >= capacity) {
        socket.send(`The capacity of connections to the relay reached its limit`);
        socket.terminate();
    }

    socket.on('message', (message) => {
        const messageObject = JSON.parse(message.toString());
        if (!(`room` in messageObject)) {
            socket.send(`Bad message format`);
            socket.terminate();
        }

        if (!('content' in messageObject)) {
            const newClient = { id: Math.floor(Math.random(0, 10) * 1000), socket: socket };

            if (!(messageObject.room in rooms)) {
                rooms[messageObject.room] = {};
                rooms[messageObject.room]['clients'] = [];
                console.log(`Client ${newClient.id} created ${messageObject.room}`);
            }

            rooms[messageObject.room]['clients'].push(newClient);
            clients++;

            console.log(`Client ${newClient.id} joined ${messageObject.room}`);
        } else {
            const sender = rooms[messageObject.room].clients.find((client) => client.socket === socket);
            rooms[messageObject.room].clients.forEach((client) => {
                client.socket.send(JSON.stringify({
                    room: messageObject.room,
                    client_id: sender.id,
                    content: messageObject.content,
                }));
            });
        }
    });

    socket.on('close', () => {
        const currentClient = defineCurrentClient(socket);
        const currentClientRoomName = defineClientRoomName(currentClient);
        removeClientFromRoom(currentClient, currentClientRoomName);

        console.log(`Client ${currentClient.id} left ${currentClientRoomName}`);

        if (!rooms[currentClientRoomName].clients.length) {
            delete rooms[currentClientRoomName];
            console.log(`${currentClientRoomName} was closed`);
        }
    });

    socket.on('end', () => {});

    socket.on('error', (error) => {
        const currentClient = defineCurrentClient(socket);
        const currentClientRoomName = defineClientRoomName(currentClient);

        console.error(`Client ${currentClient.id} received error: ${error}`);
        socket.terminate();
        removeClientFromRoom(currentClient, currentClientRoomName);
        console.error(`Client ${currentClient.id} was removed from ${currentClientRoomName}`);

        if (!rooms[currentClientRoomName].clients.length) {
            delete rooms[currentClientRoomName];
            console.log(`${currentClientRoomName} was closed`);
        }
    });
});

console.log(`server listens on 127.0.0.1:7369`);
