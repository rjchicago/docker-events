
const express = require('express');
const http = require('http');
const DockerEvents = require('./DockerEvents');
const MetricService = require('./MetricService');

DockerEvents.init();
DockerEvents.on('container', MetricService.push);

// https://docs.docker.com/engine/reference/commandline/events/
// DockerEvents.on('container', console.log);
// DockerEvents.on('image', console.log);
// DockerEvents.on('plugin', console.log);
// DockerEvents.on('volume', console.log);
// DockerEvents.on('network', console.log);
// DockerEvents.on('daemon', console.log);
// DockerEvents.on('service', console.log);
// DockerEvents.on('node', console.log);
// DockerEvents.on('secret', console.log);
// DockerEvents.on('config', console.log);

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

// app.get('/events/:type', async (req, res) => {
//     res.setHeader('content-type', 'text/plain');
//     DockerEvents.on(req.params.type, data => res.write(JSON.stringify(data, 1, 1)));
// });

const server = http.createServer(app);
server.listen(port, () => console.log(`http://localhost:${port}/metrics`));
