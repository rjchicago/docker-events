# docker-events

Listen on [Docker Events](https://docs.docker.com/engine/reference/commandline/events/) and expose as `./metrics` for [Prometheus](https://prometheus.io/).

## Environment Variables

| Required | Variable             | Description                                                                                        |
|----------|----------------------|----------------------------------------------------------------------------------------------------|
|          | HOSTNAME             | Exposed as `instance` in metrics. Example: `{{.Node.Hostname}}`                                    |
|          | SWARM_NAME           | Exposed as `env` in metrics. Example: `prod-swarm`                                                 |
|          | METRIC_EVENT_TYPES   | Comma-separated **Event Types** to expose in metrics. I.e. `"container"` or `"container, network"` |
|          | DOCKER_EVENTS_SINCE  | Initial starting point for listening on **Docker Events**. Default is `0s`                         |
