'use strict'

const express = require('express')
const asyncify = require('express-asyncify')
const request = require('request-promise-native')

const api = asyncify(express.Router())

const { endpoint, apiToken } = require('./config')


api.get('/agents', async (req, res, next) => {
    const options = {
        method: 'GET',
        url: `${endpoint}/api/agents`,
        headers: {
            'Authorization': `Bearer ${apiToken}`
        },
        json: true
    }
    let resutl
    try {
        result = await request(options)
    } catch (e) {
        return next(new Error(e.error.error))
    }

    res.send(resutl)
})

api.get('/agents/:uuid', async (req, res, next) => {
    const options = {
        method: 'GET',
        url: `${endpoint}/api/agents/${uuid}`,
        headers: {
            'Authorization': `Bearer ${apiToken}`
        },
        json: true
    }
    let resutl
    try {
        result = await request(options)
    } catch (e) {
        return next(new Error(e.error.error))
    }
    res.send(resutl)
})

api.get('/metrics/:uuid', async (req, res, next) => {
    const options = {
        method: 'GET',
        url: `${endpoint}/api/metrics/${uuid}`,
        headers: {
            'Authorization': `Bearer ${apiToken}`
        },
        json: true
    }
    let resutl
    try {
        result = await request(options)
    } catch (e) {
        return next(new Error(e.error.error))
    }
    res.send(resutl)
})

api.get('/metrics/:uuid/:type', async (req, res, next) => {
    const options = {
        method: 'GET',
        url: `${endpoint}/api/metrics/${uuid}/${type}`,
        headers: {
            'Authorization': `Bearer ${apiToken}`
        },
        json: true
    }
    let resutl
    try {
        result = await request(options)
    } catch (e) {
        return next(new Error(e.error.error))
    }
    res.send(resutl)
})
