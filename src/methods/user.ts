import { User } from "../entities/user";

export const findUser = async (data: { username?: string, email?: string, id?: string }, populate = false): Promise<User | undefined> => {
  let user: User | undefined

  if (data.username) {
    user = await User.findOne({ username: data.username }, { relations: ['groups', 'createdGroups'] })
  }
  if (!user && data.email) {
    user = await User.findOne({ email: data.email }, { relations: ['groups', 'createdGroups'] })
  }
  if (!user && data.id) {
    user = await User.findOne(data.id, { relations: ['groups', 'createdGroups'] })
  }

  if (user && populate) await populateUser(user)

  return user
}

export const populateUser = async (user: User): Promise<User> => {
  console.log(user)
  return user
}