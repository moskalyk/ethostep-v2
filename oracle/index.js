const app = require('express')()

const Hyperbee = require('hyperbee')
// This module handles networking and storage of hypercores for you
const SDK = require('hyper-sdk')
const bodyParser = require('body-parser')
const cors = require('cors')

const cron = require('node-cron');

const DB_NAME = 'CHAKRA'
let counter = {};
let sephirah = {};

const init = async () => {
	const {Hypercore} = await SDK()

  	// Initialize a hypercore for loading data
	const core = new Hypercore(DB_NAME)
  	
  	// Initialize the Hyperbee you want to use for storing data and indexes
	const db = new Hyperbee(core, {
		keyEncoding: 'utf-8', // can be set to undefined (binary), utf-8, ascii or and abstract-encoding
		valueEncoding: 'utf-8' // same options as above
	})

	db['core'] = core

	return db
}

const timer = (db) => {
	cron.schedule('*/3 * * * * *', async () => {
    	console.log('running a task every 3 seconds');

    	counter = {};

    	counter[new Date(Date.now() + 3000)] = Math.floor(Math.random() * 7)
    	counter[new Date(Date.now() + 2000)] = Math.floor(Math.random() * 7)
    	counter[new Date(Date.now() + 1000)] = Math.floor(Math.random() * 7)
    	counter[new Date()] = Math.floor(Math.random() * 7)
    	counter[new Date(Date.now() - 1000)] = Math.floor(Math.random() * 7)
    	counter[new Date(Date.now() - 2000)] = Math.floor(Math.random() * 7)
    	counter[new Date(Date.now() - 3000)] = Math.floor(Math.random() * 7)

       	sephirah = {};

    	sephirah[new Date(Date.now() + 3000)] = Math.floor(Math.random() * 10)
    	sephirah[new Date(Date.now() + 2000)] = Math.floor(Math.random() * 10)
    	sephirah[new Date(Date.now() + 1000)] = Math.floor(Math.random() * 10)
    	sephirah[new Date()] = Math.floor(Math.random() * 10)
    	sephirah[new Date(Date.now() - 1000)] = Math.floor(Math.random() * 10)
    	sephirah[new Date(Date.now() - 2000)] = Math.floor(Math.random() * 10)
    	sephirah[new Date(Date.now() - 3000)] = Math.floor(Math.random() * 10)

		console.log(counter)
		console.log(sephirah)
    	const doc = db.collection(DB_NAME).insert({
		  counter: counter,
		  sephirah: sephirah
		})
		console.log(doc)
  	});
}

const bootstrap = async () => {

	let db = await init(DB_NAME)
	timer(db)
	app.use(cors())
	app.use(bodyParser.json())
	app.use(bodyParser.urlencoded({extended:false}))

	app.get('/step', async (req,res) => {
		// res.set('Access-Control-Allow-Origin', '*');
		res.set('Access-Control-Allow-Origin', 'https://ethostep.ngrok.io');
		res.send({counter: counter})
	})

	app.get('/scan', async (req,res) => {
		// res.set('Access-Control-Allow-Origin', '*');
		res.set('Access-Control-Allow-Origin', 'https://ethostep.ngrok.io');
		res.send({sephirah: sephirah})
	})

	app.listen(1440, () => {
		console.log('listening')
		const url = `hyper://${db.core.key.toString('hex')}`
  		console.log(url)
	})
}

bootstrap()