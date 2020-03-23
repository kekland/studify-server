import { configuration } from "./config"
import { authRouter } from "./router/auth"
import express, { Router } from 'express'
import bodyParser from 'body-parser'
import { createConnection } from 'typeorm'
import { groupRouter } from "./router/group"

const bootstrap = async () => {
  // Load configuration
  const { port, options } = configuration

  // Load Express
  const app = express()
  app.use(bodyParser())
  app.use((req, res, next) => {
    console.log({ ip: req.ip, body: req.body, url: req.url })
    next()
  })

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
}

bootstrap()