import http from 'http'
import express from 'express'
import cors from 'cors'
import SocketIO from 'socket.io'
import bodyParser from 'body-parser'

import uuid from './utils/uuid'
import api from "./endpoints/api"

const app = express()
const server = http.createServer(app)
const wss = new SocketIO.Server(server, {
  "cors": {
    "origin": "*"
  }
})

app.use(cors())
app.use(bodyParser.json())
app.use(api)

const pieces = new Map()

wss.on("connect", socket => {
  console.log('new socket')

  socket.join("game")

  socket.on("create-piece", function(icon, color) {
    let id = "p-" + uuid(8)

    while (pieces.has(id)) id = "p-" + uuid(8)

    pieces.set(id, {
      x: 0, y: 0,
      icon, color
    })

    wss.in("game").emit("create-piece", id, icon, color)
  })

  socket.on("move-piece", function(id, x, y) {
    pieces.set(id, {x, y})

    wss.in("game").emit("move-piece", id, x, y)
  })

  socket.on("update-pieces", function() {
    pieces.forEach(({x, y}, id) => {
      wss.in("game").emit("move-piece", id, x, y)
    })
  })

  socket.on("delete-piece", function(id) {
    pieces.delete(id)

    wss.in("game").emit("delete-piece", id)
  })
})

server.listen(process.env.PORT || 5000, () => {
  console.log(`Server on ${process.env.PORT || 5000}`)
})
