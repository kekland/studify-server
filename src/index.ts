import "reflect-metadata";
import { configuration } from "./config"
import { authRouter } from "./router/auth"
import express, { Router } from 'express'
import bodyParser from 'body-parser'
import { createConnection } from 'typeorm'
import { groupRouter } from "./router/group"
import socketio from 'socket.io'
import { MessagingSocket } from "./socket/messaging"

const bootstrap = async () => {
  // Load configuration
  const { port, socketPort, options } = configuration

  // Load Express
  const expressServer = express()
  expressServer.use(bodyParser())
  expressServer.use((req, res, next) => {
    next()
  })

  // Load Socket.io
  const socketServer = socketio()
  MessagingSocket.initialize(socketServer)

  // Connect to mongo
  await createConnection(options)

  // Setup routers
  const routers: { [key: string]: Router } = {
    '/auth': authRouter(),
    '/group': groupRouter(),
  }

  Object.keys(routers).forEach(key => expressServer.use(key, routers[key]))

  // Start server on port
  expressServer.listen(port)
  socketServer.listen(socketPort)
}

bootstrap()