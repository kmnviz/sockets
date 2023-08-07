const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const jsonLogFilePath = path.join(logDir, 'log.json');
const textLogFilePath = path.join(logDir, 'log.txt');

process.on('uncaughtException', (error) => {
    const logMessage = `[Uncaught Exception] ${new Date().toISOString()} - ${error.stack || error}`;
    console.error(logMessage);

    appendToFile(jsonLogFilePath, logMessage, true);
    appendToFile(textLogFilePath, logMessage);

    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    const logMessage = `[Unhandled Rejection] ${new Date().toISOString()} - Reason: ${reason}`;
    console.error(logMessage);

    appendToFile(jsonLogFilePath, logMessage, true);
    appendToFile(textLogFilePath, logMessage);
});

function appendToFile(filePath, data, newLine = false) {
    fs.appendFileSync(filePath, data + (newLine ? '\n' : ''));
}

// ----------
const hostArgIndex = process.argv.findIndex((el) => el === '-h');
const portArgIndex = process.argv.findIndex((el) => el === '-p');
const capacityArgIndex = process.argv.findIndex((el) => el === '-c');
const host = hostArgIndex !== -1 ? process.argv[hostArgIndex + 1] : '';
const port = portArgIndex !== -1 ? process.argv[portArgIndex + 1] : 7369;
const capacity = capacityArgIndex !== -1 ? process.argv[capacityArgIndex + 1] : 1000;

const { WebSocketServer } = require('ws');
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

        if ('status' in messageObject) {
            return;
        }

        if (!(`room` in messageObject)) {
            socket.send(`Bad message format`);
            socket.terminate();
        }

        if (!('content' in messageObject)) {
            const newClient = { id: Math.floor(Math.random(0, 10) * 1000), nickname: messageObject.nickname, socket: socket };

            if (!(messageObject.room in rooms)) {
                rooms[messageObject.room] = {};
                rooms[messageObject.room]['clients'] = [];
                console.log(`Client ${newClient.id}:${newClient.nickname} created ${messageObject.room}`);
            }

            rooms[messageObject.room]['clients'].push(newClient);
            clients++;

            console.log(`Client ${newClient.id}:${newClient.nickname} joined ${messageObject.room}`);
        } else {
            const sender = rooms[messageObject.room].clients.find((client) => client.socket === socket);
            rooms[messageObject.room].clients.forEach((client) => {
                client.socket.send(JSON.stringify({
                    room: messageObject.room,
                    client_id: sender.id,
                    nickname: sender.nickname,
                    content: messageObject.content,
                }));
            });
        }
    });

    socket.on('close', () => {
        const currentClient = defineCurrentClient(socket);
        const currentClientRoomName = defineClientRoomName(currentClient);

        if (currentClient && currentClientRoomName) {
            removeClientFromRoom(currentClient, currentClientRoomName);

            console.log(`Client ${currentClient.id}:${currentClient.nickname} left ${currentClientRoomName}`);

            if (!rooms[currentClientRoomName].clients.length) {
                delete rooms[currentClientRoomName];
                console.log(`${currentClientRoomName} was closed`);
            }
        }
    });

    socket.on('end', () => {});

    socket.on('error', (error) => {
        const currentClient = defineCurrentClient(socket);
        const currentClientRoomName = defineClientRoomName(currentClient);

        if (currentClient && currentClientRoomName) {
            console.error(`Client ${currentClient.id}:${currentClient.nickname} received error: ${error}`);
            socket.terminate();
            removeClientFromRoom(currentClient, currentClientRoomName);
            console.error(`Client ${currentClient.id}:${currentClient.nickname} was removed from ${currentClientRoomName}`);

            if (!rooms[currentClientRoomName].clients.length) {
                delete rooms[currentClientRoomName];
                console.log(`${currentClientRoomName} was closed`);
            }
        }
    });
});

console.log(`server listens on ${host}:${port} [capacity: ${capacity}]`);
