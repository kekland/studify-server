import { IsNotEmpty, MinLength, IsEmail } from "class-validator"
import { compare, hash, genSaltSync } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { Errors } from "../../validation/errors";
import { User } from "../../entities/user";
import { PermissionLevels } from "../../validation/permissions";
import { UnauthorizedMethod, AuthorizedMethod, NoRequestData } from "../utils";
import { SignInData, SignInResponse, SignUpData, SignUpResponse, SignInWithTokenResponse } from "./_data";
import { UserMethods } from "../user/user";
import { config } from "../..";
import { NotificationMethods } from "../notifications/notifications";

export class AuthMethods {
  static signIn: UnauthorizedMethod<SignInData, SignInResponse> = async (credentials) => {
    const user = await UserMethods.findUser({ username: credentials.username }, true)

    if (!user) throw Errors.invalidCredentials

    const matches = await compare(credentials.password, user.hash)

    if (matches) {
      const token = sign({ id: user.id }, config.jwt)

      user.lastSignInTime = new Date()
      await user.save()

      const notifications = await NotificationMethods.getNotifications(user, { unreadOnly: true })
      return new SignInResponse(token, user, notifications)
    }
    else {
      throw Errors.invalidCredentials
    }
  }

  static signUp: UnauthorizedMethod<SignUpData, SignUpResponse> = async (data) => {
    const userExists = (await UserMethods.findUser({ username: data.username, email: data.email })) != null

    if (userExists) throw Errors.userExists

    const passwordHash = await hash(data.password, genSaltSync())

    const user = new User({
      email: data.email,
      username: data.username,
      name: data.name,
      hash: passwordHash,
      groups: [],
      createdGroups: [],
      permissionLevel: PermissionLevels.user,
    })

    await user.save()

    const { token } = await AuthMethods.signIn(new SignInData(data.username, data.password))

    return new SignUpResponse(token, user)
  }

  static signInWithToken: AuthorizedMethod<NoRequestData, SignInWithTokenResponse> = async (user) => {
    user.lastSignInTime = new Date()
    await user.save()

    const notifications = await NotificationMethods.getNotifications(user, { unreadOnly: true })

    return new SignInWithTokenResponse(user, notifications)
  }
}