const app = require('express')()

const Hyperbee = require('hyperbee')
// This module handles networking and storage of hypercores for you
const SDK = require('hyper-sdk')
const {DB} = require('hyperbeedeebee')
const bodyParser = require('body-parser')
const cors = require('cors')

const DB_NAME = 'CHAKRA'
let init = require('./init.js')

const bootstrap = async () => {

	let records = await init(DB_NAME)

	app.use(cors())
	app.use(bodyParser.json())
	app.use(bodyParser.urlencoded({extended:false}))

	console.log(records)

	app.post('/pull', async (req,res) => {
		console.log(req.body)
		const step = Math.floor(Math.random() * 8)

		const doc = await records.db.collection(DB_NAME).insert({
		  step: step
		})

		res.send({step: step})
	})

	app.get('/akashic/:id', async (req,res) => {
		const query = req.params.id
		console.log(query)
		const docs = await records.db.collection(DB_NAME).find({cid: query})
		res.send(docs)
	})

	app.listen(1440, () => {
		console.log('listening')
		const url = `hyper://${records.core.key.toString('hex')}`
  		console.log(url)
	})
}

bootstrap()