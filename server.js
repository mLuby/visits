const express = require("express")
const bodyParser = require("body-parser")
const uuid = require("uuid/v4")
const fuzzy = require("fuzzy")
const server = express()
const PORT = process.env.PORT || 3000

const visits = {} // {[visitId]: visit}
const users = {} // {[userId]: [visit]}

// Routes & Middleware

server.use(bodyParser.json())

server.post("/visit", addVisit)
server.get("/visit", searchVisits)
server.delete("/visit", clearVisits)

// Controllers

function addVisit (req, res) {
  const visit = req.body
  visit.visitId = uuid().split("-")[0] // first part of uuid is enough
  if (validateVisit(visit).length) return res.status(400).json(validateVisit(visit))
  visits[visit.visitId] = visit
  // TODO 5 most recent
  users[visit.userId] = (users[visit.userId] || []).concat(visit)
  while (users[visit.userId].length > 5) users[visit.userId].splice(0,1) // remove first item
  console.log("Add visit", visit)
  return res.status(201).json({visitId: visit.visitId})
}

function searchVisits (req, res) {
  const {visitId} = req.query
  if (visitId && visits[visitId]) return res.status(200).json([visits[visitId]])

  const {userId, searchString} = req.query
  if (!userId || !searchString) return res.status(400).json([
    "Must specify visitId or both userId and searchString"
  ])
  if (!users[userId]) return res.status(404).json(["userId not found"])
  const matches = fuzzy.filter(searchString, users[userId], {extract: v => v.name})
    .map(match => match.original)
  if (matches.length) return res.status(200).json(matches)
  return res.status(200).json()
}

function clearVisits (req, res={sendStatus:()=>{}}) {
  for (let key in visits) delete visits[key]
  for (let key in users) delete users[key]
  return res.sendStatus(204)
}

// Helpers

function validateVisit (visit) { // [Error]
  const errors = []
  if (!visit.userId) errors.push("Missing userId (eg user1)")
  if (!visit.name) errors.push("Missing name (eg McDonald's)")
  return errors
}

// Side Effects (export or listen on port)

if (require.main === module) { // this file is being called directly
  server.listen(PORT, () => console.log("Listening on :"+PORT))
} else { // another file is "require"ing this file
  module.exports = {server, clearVisits} // for testing
}
