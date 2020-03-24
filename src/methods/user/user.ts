import { User } from "../../entities/user";

export class UserMethods {
  static findUser = async (data: { username?: string, email?: string, id?: string }, populate = false): Promise<User | undefined> => {
    let user: User | undefined
    let relations: string[] = []

    if (populate) relations = ['groups', 'createdGroups']

    if (data.username) {
      user = await User.findOne({ username: data.username }, { relations })
    }
    if (!user && data.email) {
      user = await User.findOne({ email: data.email }, { relations })
    }
    if (!user && data.id) {
      user = await User.findOne(data.id, { relations })
    }

    return user
  }
}
