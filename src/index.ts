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
import { usersRouter } from "./router/user";
import fileUpload from 'express-fileupload'
import admin from 'firebase-admin'
import { messagingRouter } from "./router/messaging";

let isLocal = process.env.PORT == null
let config = Local.configuration
let firebaseAdminCredentials: any

if (!isLocal) {
  config = Heroku.configuration
  firebaseAdminCredentials = {
    "type": process.env.FIREBASE_TYPE,
    "project_id": process.env.FIREBASE_PROJECT_ID,
    "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
    "private_key": process.env.FIREBASE_PRIVATE_KEY,
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
    "client_id": process.env.FIREBASE_CLIENT_ID,
    "auth_uri": process.env.FIREBASE_AUTH_URI,
    "token_uri": process.env.FIREBASE_TOKEN_URI,
    "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL,
  }
}
else {
  firebaseAdminCredentials = require(__dirname.replace('build', 'firebase-admin.json'))
}
const bootstrap = async () => {
  Logging.info('Bootstrap', 'Starting server')
  // Load configuration
  const { port, options } = config

  // Load firebase
  admin.initializeApp({
    credential: admin.credential.cert(firebaseAdminCredentials),
    storageBucket: 'studify-app.appspot.com'
  })

  // Load server
  const expressServer = express()
  const server = http.createServer(expressServer)

  expressServer.use(cors())
  expressServer.use(bodyParser({ extended: true }))
  expressServer.use(fileUpload({ abortOnLimit: true, parseNested: true, limits: { fileSize: 10 * 1024 * 1024 } }))

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
    '/api/user': usersRouter(),
    '/api/messaging': messagingRouter(),
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