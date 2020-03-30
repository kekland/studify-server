import { User } from "../../entities/user";

export class UserDataResponse {
  data: User;

  constructor(data: User) {
    this.data = data
  }

  static transform(data: UserDataResponse) {
    return {
      data: User.transformMinimal(data.data)
    }
  }
}