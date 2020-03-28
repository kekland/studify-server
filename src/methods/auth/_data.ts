import { User } from "../../entities/user";
import { IsNotEmpty, IsEmail, MinLength } from "class-validator";

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

export class SignInResponse {
  token: string;
  user: User;

  constructor(token: string, user: User) {
    this.token = token
    this.user = user
  }

  static transform(data: SignInResponse) {
    return {
      token: data.token,
      user: User.transformOwner(data.user),
    }
  }
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

export class SignUpResponse {
  token: string;
  user: User;

  constructor(token: string, user: User) {
    this.token = token
    this.user = user
  }

  static transform(data: SignUpResponse) {
    return {
      token: data.token,
      user: User.transformOwner(data.user),
    }
  }
}

export class SignInWithTokenResponse {
  user: User;

  constructor(user: User) {
    this.user = user
  }

  static transform(data: SignInWithTokenResponse) {
    return {
      uesr: User.transformOwner(data.user)
    }
  }
}