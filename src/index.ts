import { configuration } from "./config"
import { MongoClient } from "mongodb"
import { RepositoryManager } from "./database/database"

const bootstrap = async () => {
  const uri = configuration.uri
  const client = new MongoClient(uri, { useNewUrlParser: true })

  await client.connect()

  RepositoryManager.initialize(client)
  console.log('Done!')
}

bootstrap()