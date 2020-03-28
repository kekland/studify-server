import "reflect-metadata";
import { configuration } from "./config-heroku"
import { authRouter } from "./router/auth"
import express, { Router } from 'express'
import bodyParser from 'body-parser'
import { createConnection } from 'typeorm'
import { groupRouter } from "./router/group"
import socketio from 'socket.io'
import { MessagingSocket } from "./socket/messaging"
import { Logging } from "./logging/logging";
import cors from 'cors'

const bootstrap = async () => {
  Logging.info('Bootstrap', 'Starting server')
  // Load configuration
  const { port, options } = configuration

  // Load Express
  const expressServer = express()

  expressServer.use(cors())
  expressServer.use(bodyParser({ extended: true }))

  expressServer.use((req, res, next) => {
    setTimeout(() => next(), 550);
  })

  expressServer.use((req, res, next) => {
    Logging.verbose('Express', `Connection from ${req.ip} for ${req.url}`)
    next()
  })

  // Load Socket.io
  const socketServer = socketio(expressServer)
  MessagingSocket.initialize(socketServer)

  // Connect to mongo
  await createConnection(options)

  // Setup routers
  const routers: { [key: string]: Router } = {
    '/auth': authRouter(),
    '/group': groupRouter(),
  }

  Object.keys(routers).forEach(key => expressServer.use(key, routers[key]))

  Logging.info('Bootstrap', `Starting Express on port ${port}`)
  expressServer.listen(port)

  Logging.info('Bootstrap', `Starting Socket.io on port ${port}`)
}

bootstrap()