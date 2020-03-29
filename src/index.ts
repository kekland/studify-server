import "reflect-metadata";
import * as Local from './config-local'
import * as Heroku from "./config-heroku"
import { authRouter } from "./router/auth"
import express, { Router, static as serveStatic } from 'express'
import bodyParser from 'body-parser'
import { createConnection } from 'typeorm'
import { groupRouter } from "./router/group"
import socketio from 'socket.io'
import { MessagingSocket } from "./socket/messaging"
import { Logging } from "./logging/logging";
import cors from 'cors'
import http from 'http'
import { notificationsRouter } from "./router/notifications";

let isLocal = process.env.PORT == null
let config = Local.configuration
if (!isLocal)
  config = Heroku.configuration

const bootstrap = async () => {
  Logging.info('Bootstrap', 'Starting server')
  // Load configuration
  const { port, options } = config

  // Load server
  const expressServer = express()
  const server = http.createServer(expressServer)

  expressServer.use(cors())
  expressServer.use(bodyParser({ extended: true }))

  if (isLocal) {
    expressServer.use((req, res, next) => {
      setTimeout(() => next(), 500);
    })
  }

  expressServer.use((req, res, next) => {
    Logging.verbose('Express', `Connection from ${req.ip} for ${req.url}`)
    next()
  })

  // Load Socket.io
  const socketServer = socketio(server)
  MessagingSocket.initialize(socketServer)

  // Connect to mongo
  await createConnection(options)

  // Setup routers
  const routers: { [key: string]: Router } = {
    '/api/auth': authRouter(),
    '/api/group': groupRouter(),
    '/api/notifications': notificationsRouter(),
  }

  Object.keys(routers).forEach(key => expressServer.use(key, routers[key]))

  // Setup client serving
  const client = __dirname.replace('build', 'client/build')
  expressServer.use(express.static(client))
  expressServer.use('*', express.static(client))

  Logging.info('Bootstrap', `Starting Express on port ${port}`)
  server.listen(port)

  Logging.info('Bootstrap', `Starting Socket.io on port ${port}`)
}

export { config }

bootstrap()