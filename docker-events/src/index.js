
const express = require('express');
const http = require('http');
const DockerEvents = require('./DockerEvents');
const ContainerEventHandler = require('./ContainerEventHandler');
const MetricService = require('./MetricService');

DockerEvents.init();
DockerEvents.on('container', ContainerEventHandler.pushEvent);

const app = express();
const port = process.env.PORT || '3000';

app.get('/health', (req, res) => {
    res.setHeader('content-type', 'text/plain');
    res.send('OK');
});

app.get('/metrics', async (req, res) => {
    res.setHeader('content-type', 'text/plain');
    res.send(await MetricService.collect());
});

const server = http.createServer(app);
server.listen(port, () => console.log(`http://localhost:${port}/metrics`));
