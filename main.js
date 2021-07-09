const { EventEmitter } = require('events');
const fs = require('fs')
const mqtt = require('mqtt')
require('dotenv').config();

const MQTT_ADDRESS = process.env.MQTT_ADDRESS
const PUBLISH_INTERVAL = process.env.PUBLISH_INTERVAL
const publishOptions = {
	qos: process.env.QOS
}

console.log(MQTT_ADDRESS, PUBLISH_INTERVAL, publishOptions.qos);

const getTrafficLightNames = () => {
	try {
		const raw = fs.readFileSync('lsa-data/lsadata_dresden.json')
		const lsa = JSON.parse(raw)
		let trafficLightNames = []
		lsa.forEach(traffiLightData => {
			trafficLightNames = [...trafficLightNames, ...traffiLightData.sgList.map(sg => sg.name)]
		})
		console.log(trafficLightNames)
		return trafficLightNames
	} catch (err) {
		console.error(err)
	}
}

const tlns = getTrafficLightNames()
const client = mqtt.connect(MQTT_ADDRESS)

client.on('connect', (e) => {
  console.log("[Prediction service] connected: " + JSON.stringify(e))
  setInterval(publishPredictions, PUBLISH_INTERVAL)
})

const publishPredictions = () => {
  tlns.forEach((tln, i)=> {
		const topicName = `${i + 1}/${tln}`
		const prediction = generateNextPrediction(topicName);
		console.log(topicName, prediction);
		client.publish(topicName, JSON.stringify(prediction), publishOptions, (err) => {
			// if (err !== null || err != undefined) {
			// 	console.log(err)
			// }
		})
	})
}



const MAX_THRESHOLD = 85
const MIN_THRESHOLD = 60

const generateNextPrediction = (topicName) => {
	const date = new Date()
	const [mo, d, y] = [date.getMonth()+1, date.getDate(), date.getFullYear()];
	const [h, mi, s] = [date.getHours(), date.getMinutes(), date.getSeconds()];
	const randomThreshold = Math.floor(Math.random()*(MAX_THRESHOLD-MIN_THRESHOLD+1)+MIN_THRESHOLD);
	return {
    "signalGroupId": topicName,
    "greentimeThreshold": randomThreshold,
		"startTime": `${y}-${mo < 10 ? '0'+mo : mo}-${d < 10 ? '0'+ d : d} ${h}:${mi < 10 ? '0'+mi : mi}:${s < 10 ? '0'+s : s}`,
    "timestamp": +date,
    "value": [0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,4,15,50,60,70,88,99,100,100,100,100,100,100,100,98,87,76,65,54,32,21,12,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
	}
}



