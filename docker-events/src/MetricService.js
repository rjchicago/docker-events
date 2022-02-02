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
        return [...new Set(globalLabels.concat(
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
}

module.exports = MetricService;
