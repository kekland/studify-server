import { MinLength, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Group } from "../../entities/group";
import { Message } from "../../entities/message";
import { User } from "../../entities/user";

export class GroupCreateData {
  @MinLength(6)
  name!: string;

  @IsNotEmpty()
  description!: string;

  @IsNumber()
  colorId!: number;

  @IsString()
  icon!: string;
}

export class GroupUpdateData {
  @MinLength(6)
  name!: string;

  @IsNotEmpty()
  description!: string;

  @IsNumber()
  colorId!: number;
  
  @IsString()
  icon!: string;
}

export class GroupGetData {
}
export class GroupGetAllData {
}
export class GroupJoinData {
}
export class GroupLeaveData {
}

export class GroupJoinResponse {
  group: Group;

  constructor(group: Group) {
    this.group = group;
  }

  static transform(data: GroupJoinResponse) {
    return {
      group: Group.transform(data.group),
    }
  }
}

export class GroupLeaveResponse {
  group: Group;

  constructor(group: Group) {
    this.group = group;
  }

  static transform(data: GroupJoinResponse) {
    return {
      group: Group.transform(data.group),
    }
  }
}

export class GroupGetResponse {
  group: Group | undefined;

  constructor(group: Group | undefined) {
    this.group = group
  }

  static transform(data: GroupGetResponse) {
    return {
      group: data.group ? Group.transform(data.group) : undefined,
    }
  }
}
export class GroupGetMultipleResponse {
  groups: Group[];

  constructor(groups: Group[]) {
    this.groups = groups
  }

  static transform(data: GroupGetMultipleResponse) {
    return {
      groups: data.groups.map(group => Group.transform(group))
    }
  }
}

export class GroupGetUsersResponse {
  users: User[];

  constructor(users: User[]) {
    this.users = users
  }

  static transform(data: GroupGetUsersResponse) {
    return {
      users: data.users.map(user => User.transformMinimal(user))
    }
  }
}