const ws = require('ws');
const url = 'ws://127.0.0.1:7369';

const client = new ws(url);

client.on('open', () => {
    console.log(`connected to ${url}`);
    client.send(`random: ${Math.floor(Math.random(0, 10) * 1000)}`);
});

client.on('message', (message) => {
    console.log('message: ', message);
});
