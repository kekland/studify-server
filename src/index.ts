import { configuration } from "./config"
import { MongoClient } from "mongodb"
import { RepositoryManager } from "./database/database"
import { authRouter } from "./router/auth"
import express, { Router } from 'express'
import bodyParser from 'body-parser'
import { groupRouter } from "./router/group"

const bootstrap = async () => {
  // Load configuration
  const { port, mongo } = configuration

  // Load Express
  const app = express()
  app.use(bodyParser())
  app.use((req, res, next) => {
    console.log({ ip: req.ip, body: req.body, url: req.url })
    next()
  })

  // Connect to mongo
  const client = new MongoClient(mongo.uri, { useNewUrlParser: true })
  await client.connect()

  // Initialize repositories
  RepositoryManager.initialize(client)

  // Setup routers
  const routers: { [key: string]: Router } = {
    '/auth': authRouter(),
    '/group': groupRouter(),
  }

  Object.keys(routers).forEach(key => app.use(key, routers[key]))

  // Start server on port
  app.listen(port)
}

bootstrap()