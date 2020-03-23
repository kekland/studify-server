import { IsNotEmpty, MinLength, IsEmail } from "class-validator"
import * as UserMethods from './user'
import { compare, hash, genSaltSync } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { Errors } from "../validation/errors";
import { configuration } from "../config";
import { User } from "../classes/user";
import { PermissionLevels } from "../validation/permissions";
import { RepositoryManager } from "../database/database";
import { UnauthorizedMethod } from "./utils";

export class SignInData {
  @IsNotEmpty()
  username!: string;

  @IsNotEmpty()
  password!: string;

  constructor(username: string, password: string) {
    this.username = username
    this.password = password
  }
}

export interface SignInResponse {
  token: string;
}

export class SignUpData {
  @IsEmail()
  email!: string;

  @MinLength(6)
  username!: string;

  @MinLength(8)
  password!: string;

  @IsNotEmpty()
  name!: string;
}

export interface SignUpResponse {
  token: string;
  user: User;
}

export const signIn: UnauthorizedMethod<SignInData, SignInResponse> = async (credentials) => {
  const user = await UserMethods.findUser({ username: credentials.username })

  if (!user) throw Errors.invalidCredentials

  const matches = await compare(credentials.password, user.hash)

  if (matches) {
    const token = sign({ id: user.id }, configuration.jwt)
    return { token }
  }
  else {
    throw Errors.invalidCredentials
  }
}

export const signUp: UnauthorizedMethod<SignUpData, SignUpResponse> = async (data) => {
  const userExists = (await UserMethods.findUser({ username: data.username, email: data.email })) != null

  if (userExists) throw Errors.userExists

  const passwordHash = await hash(data.password, genSaltSync())

  const user = new User({
    email: data.email,
    username: data.username,
    name: data.name,
    hash: passwordHash,
    friends: [],
    groups: [],
    permissionLevel: PermissionLevels.user,
  })

  await RepositoryManager.userRepository.save(user)

  const { token } = await signIn(new SignInData(data.username, data.password))

  return { token, user }
}
