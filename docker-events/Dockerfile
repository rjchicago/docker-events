FROM node:16-alpine

# install docker
RUN apk add --update curl docker openrc
RUN rc-update add docker boot

WORKDIR /docker-events
COPY package*.json ./
RUN npm install --quiet
COPY src/ ./src/

EXPOSE 3000
EXPOSE 9229

CMD [ "npm", "run", "start" ]