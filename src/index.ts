import { configuration } from "./config"
import { authRouter } from "./router/auth"
import express, { Router } from 'express'
import bodyParser from 'body-parser'
import { createConnection } from 'typeorm'
import { groupRouter } from "./router/group"
import socketio from 'socket.io'

const bootstrap = async () => {
  // Load configuration
  const { port, socketPort, options } = configuration

  // Load Express
  const app = express()
  app.use(bodyParser())
  app.use((req, res, next) => {
    console.log({ ip: req.ip, body: req.body, url: req.url })
    next()
  })

  // Load Socket.io
  const io = socketio()

  // Connect to mongo
  const connection = await createConnection(options)
  // await connection.connect()

  // Setup routers
  const routers: { [key: string]: Router } = {
    '/auth': authRouter(),
    '/group': groupRouter(),
  }

  Object.keys(routers).forEach(key => app.use(key, routers[key]))

  // Start server on port
  app.listen(port)
  io.listen(socketPort)
}

bootstrap()