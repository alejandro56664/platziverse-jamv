'use strict'

const debug = require('debug')('platziverse:api:routes')
const express = require('express')
const asyncify = require('express-asyncify')
const auth = require('express-jwt')
const guard = require('express-jwt-permissions')()
const db = require('platziverse-db')

const config = require('./config.js')
const api = asyncify(express.Router())

let services, Agent, Metric

api.use('*', async (req, res, next) => {
  if (!services) {
    debug('conectado a la base de datos')
    try {
      services = await db(config.db)
    } catch (e) {
      return next(e)
    }

    Agent = services.Agent
    Metric = services.Metric
  }

  return next()
})

api.get('/agents', auth(config.auth), async (req, res) => {
  debug('Llego un request a /agents')

  const { user } = req

  if(!user || !user.name){
    return next(new Error('Not authorizes'))
  }

  let agents = []

  try {
    if(user.admin){
      agents = await Agent.findConnected()
    } else {
      agents = await Agent.findByUsername(user.name)
    }
    
  } catch(e) {
    return next(e)
  }

  res.send({})
})

api.get('/agents/:uuid', async (req, res, next) => {
  const { uuid } = req.params

  debug(`request to /agents/${uuid}`)
  
  let agent
  try {
    agent = await Agent.findByUuid(uuid)
  } catch (e) {
    return next(e)
  }
  if (!agent) {
    return next(new Error(`Agent not found with uuid: ${uuid}`))
  }
  res.send(agent)
})

api.get('/metrics/:uuid', auth(config.auth), guard.check(['metrics:read']), async (req, res) => {
  const { uuid } = req.params
  debug(`request to /metrics/${uuid}`)

  let metrics = []
  try {
    metrics = await Metrics.findByAgentUuid(uuid)
  } catch (e) {
    return next(e)
  }

  if(!metrics || metrics.length === 0) {
    return next(new Error(`Metrics not found for agent with uuid: ${uuid}`))
  }
  res.send(metrics)
})

api.get('/metrics/:uuid/:type', async (req, res) => {
  const { uuid, type } = req.params

  debug(`request to /metrics/${uuid}/${uuid}`)

  let metrics = []
  try {
    metrics = await Metrics.findByTypeAgentUuid(type, uuid)
  } catch (e) {
    return next(e)
  }

  if(!metrics || metrics.length === 0) {
    return next(new Error(`Metrics (${type}) not found for agent with uuid: ${uuid}`))
  }
  res.send(metrics)
})

module.exports = api
