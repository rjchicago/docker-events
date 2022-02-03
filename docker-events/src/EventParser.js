
class EventParser {
    static parse = (event) => {
        const {Type: type} = event;
        return Object.prototype.hasOwnProperty.call(EventParser.parsers, type)
            ? EventParser.parsers[type](event)
            : event;
    }

    static parsers = {
        container: (event) => {
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
    }
}

module.exports = EventParser;
