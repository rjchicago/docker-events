const client = require("prom-client");

const hostname = process.env.HOSTNAME || undefined;
const swarmName = process.env.SWARM_NAME || undefined;
const globalLabels = ['env', 'instance'];

class MetricService {
    static collections = {};
    static push = (event) => {
        const jsonKey = JSON.stringify(event);
        if (!MetricService.collections[jsonKey]) {
            MetricService.collections[jsonKey] = {_labels: Object.keys(event), count: 0};
        }
        MetricService.collections[jsonKey].count++;
    };
    static getLabels = () => {
        return [...new Set([].concat(globalLabels).concat(
                ...Object.keys(MetricService.collections)
                .map(jsonKey => Object.keys(JSON.parse(jsonKey)))   
        ))];
    };
    static collect = async () => {
        const registry = new client.Registry();
        const labelNames = MetricService.getLabels();
        const gauge = new client.Gauge({
            name: `docker_events`,
            help: `[${labelNames.join(', ')}]`,
            labelNames,
            registers: [registry],
        });
        Object.keys(MetricService.collections).forEach(jsonKey => {
            const event = JSON.parse(jsonKey);
            Object.assign(event, {env: swarmName, instance: hostname});
            gauge.labels(event).set(MetricService.collections[jsonKey].count);
        });
        return await registry.metrics();
    };
    // static pushName = (type, event) => {
    //     if (!MetricService.collections[type]) {
    //         MetricService.collections[type] = {_labels: Object.keys(event)};
    //     }
    //     const jsonKey = JSON.stringify(event);
    //     if (!MetricService.collections[type][jsonKey]) {
    //         MetricService.collections[type][jsonKey] = 0;
    //     }
    //     MetricService.collections[type][jsonKey]++;
    // }

    // static collect = async () => {
    //     const registry = new client.Registry();
    //     Object.keys(MetricService.collections).forEach(key => {
    //         const collection = MetricService.collections[key];
    //         const gauge = new client.Gauge({
    //             name: `docker_${key}_events`,
    //             help: `Docker Events: ${key}`,
    //             labelNames: collection._labels,
    //             registers: [registry],
    //         });
    //         Object.keys(collection).filter(key => key.startsWith('{')).forEach(jsonKey => {
    //             const event = JSON.parse(jsonKey);
    //             gauge.labels(event).set(collection[jsonKey]);
    //         });
    //     });
    //     return await registry.metrics();
    // };
}

module.exports = MetricService;
