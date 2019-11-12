const test = require("tape")
const request = require("supertest")
const {server, clearVisits} = require("./server.js")

test("Lookup by visit", async t => {
  clearVisits()

  let visitId = null

  await request(server).post("/visit").send({ userId: "user1", name: "McDonald's" })
    .set('Accept', 'application/json').expect('Content-Type', /json/)
    .expect(201).expect(res => {
      t.equal(typeof res.body.visitId, 'string')
      visitId = res.body.visitId
    })

  await request(server).get(`/visit?visitId=${visitId}`)
  .set('Accept', 'application/json').expect('Content-Type', /json/)
  .expect(200, [{ userId: "user1", name: "McDonald's", visitId }])

  t.end()
})

test("Lookup by userId and searchString", async t => {
  clearVisits()

  let visitIds = {}

  await Promise.all([
    request(server).post("/visit").send({ userId: "user1", name: "Arby's" }),
    request(server).post("/visit").send({ userId: "user1", name: "Danny's" }),
    request(server).post("/visit").send({ userId: "user1", name: "Wandy's" }),
    request(server).post("/visit").send({ userId: "user1", name: "McDonald's" }),
    request(server).post("/visit").send({ userId: "user1", name: "Friandly's" }),
    request(server).post("/visit").send({ userId: "user1", name: "Carl's JR" }),
  ]).then(([arby, denny, wendy, mcd, friendly, carl]) => {
    visitIds.arby = arby.body.visitId
    visitIds.denny = denny.body.visitId
    visitIds.wendy = wendy.body.visitId
    visitIds.mcd = mcd.body.visitId
    visitIds.friendly = friendly.body.visitId
    visitIds.carl = carl.body.visitId
  })

  await request(server).get(`/visit?userId=user1&searchString=a`)
  .set('Accept', 'application/json').expect('Content-Type', /json/)
  .expect(200, [
    { userId: "user1", name: "Danny's", visitId: visitIds.denny },
    { userId: "user1", name: "Wandy's", visitId: visitIds.wendy },
    { userId: "user1", name: "McDonald's", visitId: visitIds.mcd },
    { userId: "user1", name: "Friandly's", visitId: visitIds.friendly },
    { userId: "user1", name: "Carl's JR", visitId: visitIds.carl },
    // { userId: "user1", name: "Arby's", visitId: visitIds.arby },
  ])

  await request(server).get(`/visit?userId=user1&searchString=dy`)
  .set('Accept', 'application/json').expect('Content-Type', /json/)
  .expect(200, [
    { userId: "user1", name: "Wandy's", visitId: visitIds.wendy },
    { userId: "user1", name: "Danny's", visitId: visitIds.denny },
    { userId: "user1", name: "Friandly's", visitId: visitIds.friendly },
  ])

  await request(server).get(`/visit?userId=user1&searchString=x`)
  .set('Accept', 'application/json').expect('Content-Type', /json/)
  .expect(200, "")

  t.end()
})

test("Lookup by userId and searchString", async t => {
  clearVisits()

  await request(server).get(`/visit?searchString=x`)
  .set('Accept', 'application/json').expect('Content-Type', /json/)
  .expect(400, ["Must specify visitId or both userId and searchString"])

  t.end()
})
