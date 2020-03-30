import { User } from "../../entities/user";
import { UnauthorizedMethod, AuthorizedMethod, NoRequestData } from "../utils";
import { UserDataResponse } from "./_data";
import { Errors } from "../../validation/errors";

type Relation = 'groups' | 'createdGroups'
export class UserMethods {
  static findUser = async (data: { username?: string, email?: string, id?: string }, populate = false): Promise<User | undefined> => {
    let user: User | undefined
    let relations: Relation[] = []

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
  static _getUserData = async (id: string): Promise<User | undefined> => {
    const user = UserMethods.findUser({ id }, true)
    return user
  }

  static getUserData: AuthorizedMethod<NoRequestData, UserDataResponse> = async (user, data, params) => {
    if (!params?.userId)
      throw Errors.invalidRequest

    const foundUser = await UserMethods._getUserData(params.userId)

    if (!foundUser)
      throw Errors.invalidRequest

    return new UserDataResponse(foundUser)
  }
}
