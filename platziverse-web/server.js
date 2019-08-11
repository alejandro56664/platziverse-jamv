'use strict'

const debug = require('debug')('platziverse:web')
const chalk = require('chalk')
const path = require('path')
const http = require('http')
const asyncify = require('express-asyncify')
const express = require('express')
const socketio = require('socket.io')

const PlatziverseAgent = require('platziverse-agent')

const proxy = require('./proxy')

const { pipe } = require('./utils')
const { mqttHost } = require('./config')

const port = process.env.PORT || 8080
const app = asyncify(express())

const server = http.createServer(app)
const io = socketio(server)

const agent = new PlatziverseAgent({
  mqtt:{
    host: mqttHost
  }
})
app.use(express.static(path.join(__dirname, 'public')))
app.use('/', proxy)

app.use((err, req, res, next) => {
    debug(`Error: ${err.message}`)
  
    if (err.message.match(/not found/)) {
      return res.status(404).send({ error: err.message })
    }
  
    res.status(500).send({ error: err.message })
  })

// socket /websockets

io.on('connect', socket => {
    debug(`Se conecto: ${socket.id}`)
    pipe(agent, socket)
    /*
    agent.on('agent/message', payload => {
        socket.emit('agent/message', payload)
    })

    agent.on('agent/connected', payload => {
        socket.emit('agent/connected', payload)
    })

    agent.on('agent/disconnected', payload => {
        socket.emit('agent/disconnected', payload)
    })
    */


})

function handleFatalError (err) {
    console.error(`${chalk.red('[fatal error]')} ${err.message}`)
    console.error(err.stack)
    process.exit(1)
  }

server.listen(port, ()=> {
    console.log(`${chalk.green('[platziverse-web]')} server esta corriendo en el puerto ${port}`)
    agent.connect()
})

process.on('unhandledException', handleFatalError)
process.on('unhandledRejection', handleFatalError)
