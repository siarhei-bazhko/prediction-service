const mqtt = require('mqtt')
require('dotenv').config();
const client = mqtt.connect(process.env.MQTT_ADDRESS)

console.log(process.env.TOPIC);

client.on('connect', (e) => {
  console.log("[subscriber] connected: " + JSON.stringify(e));
  client.subscribe(process.env.TOPIC)
})

client.on('message', (topic, message) => {
  switch (topic) {
    case process.env.TOPIC:
     console.log(process.env.TOPIC);
      return console.log(JSON.parse(message.toString()));
  }
  console.log('No handler for topic %s', topic)
})
