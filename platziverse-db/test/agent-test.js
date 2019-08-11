'use strict'

const test = require('ava')
const sinon = require('sinon')

const proxyquire = require('proxyquire')
const agentFixtures = require('./fixtures/agent')

const config = {
  logging: function () {}
}

const MetricStub = {
  belongsTo: sinon.spy()
}

const single = Object.assign({}, agentFixtures.single)
let AgentStub = null
let db = null
let sandbox = null

const id = 1
const uuid = 'yyy-yyy-yyy'

const uuidArgs = {
  where: {
    uuid: uuid
  }
}

const connectedArgs = {
  where: {
    connected: true
  }
}

const usernameArgs = {
  where: {
    username: 'platzi',
    connected: true
  }
}

const newAgent = {
  id: 1,
  uuid: '123-123-123',
  name: 'test',
  username: 'test',
  hostname: 'test',
  pid: 0,
  connected: true
}
test.beforeEach(async () => {
  sandbox = sinon.createSandbox()
  AgentStub = {
    hasMany: sandbox.spy()
  }

  // model create Stub
  AgentStub.create = sandbox.stub()
  AgentStub.create.withArgs(newAgent).returns(Promise.resolve({
    toJSON () { return newAgent }
  }))

  // model findOne Stub
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.byUuid(uuid)))

  // model findById Stub
  AgentStub.findById = sandbox.stub()
  AgentStub.findById.withArgs(id).returns(Promise.resolve(agentFixtures.byId(id)))

  // model update Stub
  AgentStub.update = sandbox.stub()
  AgentStub.update.withArgs(single, uuidArgs).returns(Promise.resolve(single))

  // model findAll Stub
  AgentStub.findAll = sandbox.stub()
  AgentStub.findAll.withArgs(connectedArgs).returns(Promise.resolve(agentFixtures.connected))
  AgentStub.findAll.withArgs(usernameArgs).returns(Promise.resolve(agentFixtures.platzi))

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })

  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

test('Agent', t => {
  t.truthy(db.Agent, 'Agent service deberia existir')
})

test('make it pass', t => {
  t.pass()
})

test.serial('Setup', t => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany fue ejecutada')
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'Argument deberia ser MetricStub')
  t.true(MetricStub.belongsTo.called, 'MetricModel.belongsTo fue ejecutada')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'Argument deberia ser AgentStub')
})

test.serial('Agent#findById', async t => {
  const agent = await db.Agent.findById(id)
  t.true(AgentStub.findById.called, 'findById debe ser llamado')
  t.true(AgentStub.findById.calledWith(id), 'findById debe ser llamado con el parametro con id')
  t.deepEqual(agent, agentFixtures.byId(id), 'deberia ser igual')
})

test.serial('Agent#findByUiid', async t => {
  const agent = await db.Agent.findByUuid(uuid)
  t.true(AgentStub.findOne.called, 'findOne debe ser llamado')
  t.true(AgentStub.findOne.calledWith(uuidArgs), 'findOne debe ser llamado con el parametro con uuidArgs')
  t.deepEqual(agent, agentFixtures.byUuid(uuid), 'deberia ser igual')
})

test.serial('Agent#findByUsername', async t => {
  const agents = await db.Agent.findByUsername('platzi')
  t.true(AgentStub.findAll.called, 'findAll debe ser llamado')
  t.true(AgentStub.findAll.calledOnce, 'findAll debe ser llamado una vez')
  t.true(AgentStub.findAll.calledWith(usernameArgs), 'findAll debe ser llamado con el parametro con findAll')
  t.is(agents.length, agentFixtures.platzi.length, 'debería tener la misma longitud del fixture')
  t.deepEqual(agents, agentFixtures.platzi, 'deberia ser igual')
})

test.serial('Agent#createOrUpdate - exist', async t => {
  const agent = await db.Agent.createOrUpdate(single)
  t.true(AgentStub.findOne.called, 'findOne debió ser llamado')
  t.true(AgentStub.findOne.calledTwice, 'findOne debió ser llamado dos veces')
  t.true(AgentStub.update.calledOnce, 'update debió ser llamado una vez')
  t.deepEqual(agent, single, 'deberian ser iguales')
})

test.serial('Agent#createOrUpdate - new', async t => {
  const agent = await db.Agent.createOrUpdate(newAgent)
  t.true(AgentStub.findOne.called, 'findOne debió ser llamado')
  t.true(AgentStub.findOne.calledOnce, 'findOne debió ser llamado una vez')
  t.true(AgentStub.findOne.calledWith({
    where: {
      uuid: newAgent.uuid
    }
  }), 'findOne debió ser llamado con un uuid como argumento')
  t.true(AgentStub.create.called, 'create debió ser llamado')
  t.true(AgentStub.create.calledOnce, 'create debió ser llamado una vez')
  t.true(AgentStub.create.calledWith(newAgent), 'create debió ser llamado con un newAgent como argumento')
  t.deepEqual(agent, newAgent, 'deberian ser iguales')
})

// todo queda pendiente las pruebas de los metodos: findAll, findConnected
