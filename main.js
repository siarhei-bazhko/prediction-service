const fs = require('fs')
const mqtt = require('mqtt')
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV == 'local') {
	require('dotenv').config();
}

const MQTT_ADDRESS = process.env.MQTT_ADDRESS || 'mqtt://localhost:1883'
const PUBLISH_INTERVAL = +process.env.PUBLISH_INTERVAL || 5000
const QOS = process.env.QOS || 0;
const publishOptions = {
	qos: +QOS,
	retain: false,
	dup: false
}

console.info(MQTT_ADDRESS, PUBLISH_INTERVAL, publishOptions.qos);

const getTrafficLightNames = () => {
	try {
		const raw = fs.readFileSync('lsa-data/lsadata_dresden.json')
		const lsa = JSON.parse(raw)
		let trafficLightNames = []
		lsa.forEach(traffiLightData => {
			trafficLightNames = [...trafficLightNames, ...traffiLightData.sgList.map(sg => `${traffiLightData.id}/${sg.name}`)]
		})
		console.info(trafficLightNames)
		return trafficLightNames
	} catch (err) {
		console.error(err)
	}
}

const tlns = getTrafficLightNames()
const MAX_THRESHOLD = 85
const MIN_THRESHOLD = 60

const generateNextPrediction = (topicName) => {
	const date = new Date()
	const [mo, d, y] = [date.getMonth()+1, date.getDate(), date.getFullYear()];
	const [h, mi, s] = [date.getHours(), date.getMinutes(), date.getSeconds()];
	const randomThreshold = Math.floor(Math.random()*(MAX_THRESHOLD-MIN_THRESHOLD+1)+MIN_THRESHOLD);
	return {
    signalGroupId: topicName,
    greentimeThreshold: randomThreshold,
		startTime: `${y}-${mo < 10 ? '0'+mo : mo}-${d < 10 ? '0'+ d : d} ${h}:${mi < 10 ? '0'+mi : mi}:${s < 10 ? '0'+s : s}`,
    timestamp: +date,
    value: [0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,4,15,50,60,70,88,99,100,100,100,100,100,100,100,98,87,76,65,54,32,21,12,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
	}
}

const publishPredictions = () => {
  tlns.forEach((tln)=> {
		const topicName = tln;
		const prediction = generateNextPrediction(topicName);
		client.publish(topicName, JSON.stringify(prediction), publishOptions)
	})
}

const client = mqtt.connect(MQTT_ADDRESS)
client.setMaxListeners(0)
client.on('connect', async e => {
	const connMsg = "[Prediction service] connected: " + JSON.stringify(e);
	console.log(connMsg)
	setInterval(publishPredictions, PUBLISH_INTERVAL)
})

