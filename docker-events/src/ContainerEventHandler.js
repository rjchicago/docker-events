const MetricService = require('./MetricService');

class ContainerEventHandler {
    static parseEvent = (event) => {
        const {
            Type: type,
            Action: action,
            from: image,
            Actor: {
                Attributes: {
                    'com.docker.stack.namespace': stack_name,
                    'com.docker.swarm.service.name': service_name
                }
            }
        } = event;
        return {
            type,
            action,
            image,
            stack_name,
            service_name
        };
    }

    static pushEvent = (event) => {
        const parsed = ContainerEventHandler.parseEvent(event);
        MetricService.push(parsed);
    }
}

module.exports = ContainerEventHandler;
