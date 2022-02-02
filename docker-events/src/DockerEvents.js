const { spawn, execSync } = require('child_process');
const EventEmitter = require('events');

const SWARM_MODE = process.env.SWARM_MODE === 'true';
const DOCKER_TLS_PATH = process.env.DOCKER_TLS_PATH || undefined;

class DockerEvents {
    static init = () => {
        DockerEvents._eventEmitter = new EventEmitter();
        DockerEvents.listen();
    };
    static on = (type, listener) => DockerEvents._eventEmitter.on(type, listener);

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
        if (node) DockerEvents.listening = DockerEvents.listening.filter(n => n === node);
        DockerEvents.listen();
    };

    static listening = [];

    static listen = async () => {
        console.log(`SWARM_MODE=${SWARM_MODE}`);
        if (SWARM_MODE) {
            if (!DOCKER_TLS_PATH) throw Error(`DOCKER_TLS_PATH is required for Swarm mode.`);
            const nodes = execSync('docker node ls --format "{{.Hostname}}"').toString().match(/^(.+)$/gm);
            nodes.filter(node => !DockerEvents.listening.includes(node)).forEach(node => {
                console.log(`DockerEvents.listen: ${node}`);
                DockerEvents.listening.push(node);
                const DOCKER_CMD_OPTIONS = `-H=${node} --tlsverify --tlscacert=${DOCKER_TLS_PATH}/ca.pem --tlscert=${DOCKER_TLS_PATH}/cert.pem --tlskey=${DOCKER_TLS_PATH}/key.pem`;
                const child = spawn('docker', [ DOCKER_CMD_OPTIONS, 'events', '--since', DockerEvents.nextSince, '--format', '"{{json .}}"' ], { shell: true });
                child.stderr.pipe(process.stderr);
                child.stdout.setEncoding('utf8');
                child.stdout.on('data', DockerEvents.onData);
                child.on('close', (code) => DockerEvents.onClose(code, node));
            });
        } else {
            console.log(`DockerEvents.listen: local`);
            const child = spawn('docker', [ 'events', '--since', DockerEvents.nextSince, '--format', '"{{json .}}"' ], { shell: true });
            child.stderr.pipe(process.stderr);
            child.stdout.setEncoding('utf8');
            child.stdout.on('data', DockerEvents.onData);
            child.on('close', DockerEvents.onClose);
        }
    };
}

module.exports = {
    init: DockerEvents.init,
    on: DockerEvents.on
};
