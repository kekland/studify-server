import { IsNotEmpty, MinLength, IsEmail } from "class-validator"
import { compare, hash, genSaltSync } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { Errors } from "../../validation/errors";
import { User } from "../../entities/user";
import { PermissionLevels } from "../../validation/permissions";
import { UnauthorizedMethod } from "../utils";
import { SignInData, SignInResponse, SignUpData, SignUpResponse } from "./_data";
import { UserMethods } from "../user/user";
import { config } from "../..";

export class AuthMethods {
  static signIn: UnauthorizedMethod<SignInData, SignInResponse> = async (credentials) => {
    const user = await UserMethods.findUser({ username: credentials.username }, true)

    if (!user) throw Errors.invalidCredentials

    const matches = await compare(credentials.password, user.hash)

    if (matches) {
      const token = sign({ id: user.id }, config.jwt)
      return new SignInResponse(token, user)
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
}