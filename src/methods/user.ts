import { User } from "../classes/user";
import { RepositoryManager } from "../database/database";
import { ObjectId } from "mongodb";

export const findUser = async (data: { username?: string, email?: string, id?: string }): Promise<User | null> => {
  let user: User | null = null

  if (data.username) {
    user = await RepositoryManager.userRepository.findOne({ username: data.username })
  }
  if (!user && data.email) {
    user = await RepositoryManager.userRepository.findOne({ email: data.email })
  }
  if (!user && data.id) {
    user = await RepositoryManager.userRepository.findById(new ObjectId(data.id))
  }

  return user
}
