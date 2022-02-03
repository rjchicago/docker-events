const { spawn } = require('child_process');
const EventEmitter = require('events');

class DockerEvents {
    static init = () => {
        DockerEvents._eventEmitter = new EventEmitter();
        DockerEvents.listen();
    };

    static on = (type, listener) => {
        console.log(`addListener: ${type}`)
        DockerEvents._eventEmitter.addListener(type, listener);
    };
    static get nextSince() {
        const since = EventEmitter._since || process.env.DOCKER_EVENTS_SINCE || '0s';
        EventEmitter._since = Math.floor(new Date().getTime() / 1000);
        return since;
    };

    static parseJsonPerRow = (data) => {
        const rows = data.match(/^(.+)$/gm);
        if (rows === null) return [];
        return rows.map(JSON.parse);
    };

    static onData = (data) => {
        const events = DockerEvents.parseJsonPerRow(data);
        events.map(event => {
            const {Type: type} = event;
            DockerEvents._eventEmitter.emit(type, event);
        });
    };

    static onClose = (code, node) => {
        if (code) console.log(`process exited ${code}`);
        DockerEvents.listen();
    };

    static listen = async () => {
        console.log(`DockerEvents.listen: local`);
        const child = spawn('docker', [ 'events', '--since', DockerEvents.nextSince, '--format', '"{{json .}}"' ], { shell: true });
        child.stderr.pipe(process.stderr);
        child.stdout.setEncoding('utf8');
        child.stdout.on('data', DockerEvents.onData);
        child.on('close', DockerEvents.onClose);
    };
}

module.exports = {
    init: DockerEvents.init,
    on: DockerEvents.on
};
