const client = require("prom-client");

const HOSTNAME = process.env.HOSTNAME || undefined;
const SWARM_NAME = process.env.SWARM_NAME || undefined;
const GLOBAL_LABELS = { env: SWARM_NAME, instance: HOSTNAME };

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
        return [...new Set(Object.keys(GLOBAL_LABELS).concat(
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
            const labels = JSON.parse(jsonKey);
            Object.assign(labels, GLOBAL_LABELS);
            gauge.labels(labels).set(MetricService.collections[jsonKey].count);
        });
        return await registry.metrics();
    };
}

module.exports = MetricService;
