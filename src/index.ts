import { configuration } from "./config"
import { MongoClient } from "mongodb"
import { RepositoryManager } from "./database/database"
import { authRouter } from "./router/auth"
import express from 'express'
import bodyParser from 'body-parser'

const bootstrap = async () => {
  // Load configuration
  const {port, uri} = configuration

  // Load Express
  const app = express()
  app.use(bodyParser())

  // Connect to mongo
  const client = new MongoClient(uri, { useNewUrlParser: true })
  await client.connect()

  // Initialize repositories
  RepositoryManager.initialize(client)
  
  // Setup routers
  const routers = [
    authRouter(),
  ]

  routers.forEach(router => app.use(router))

  // Start server on port
  app.listen(port)
}

bootstrap()