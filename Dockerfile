FROM  node:14.12.0

COPY lsa-data /lsa-data
COPY .env .
COPY main.js .
COPY package*.json ./
RUN npm install
ENV NODE_ENV=dev\
    MQTT_ADDRESS='mqtt://localhost:1883'\
    PUBLISH_INTERVAL=5000 QOS=0

CMD node main.js
