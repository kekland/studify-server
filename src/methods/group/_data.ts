import { MinLength, IsNotEmpty, IsNumber, IsString, ValidateIf } from "class-validator";
import { Group, IGroup } from "../../entities/group";
import { Message } from "../../entities/message";
import { User } from "../../entities/user";
import { PaginatedData } from "../messaging/_data";

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

export class GroupLoadDataResponse {
  group: Group;
  lastMessages: Message[];
  unreadMessages: number;
  mutedUntil?: Date;

  constructor(group: Group, lastMessages: Message[], unreadMessages: number, mutedUntil?: Date) {
    this.group = group
    this.lastMessages = lastMessages
    this.unreadMessages = unreadMessages
    this.mutedUntil = mutedUntil
  }

  static transform(data: GroupLoadDataResponse) {
    return {
      group: Group.transform(data.group),
      lastMessages: data.lastMessages.map((message) => Message.transformSocket(message)),
      unreadMessages: data.unreadMessages,
      mutedUntil: data.mutedUntil
    }
  }
}

export class GroupLoadAllDataResponse {
  data: GroupLoadDataResponse[];

  constructor(data: GroupLoadDataResponse[]) {
    this.data = data
  }

  static transform(data: GroupLoadAllDataResponse) {
    return {
      data: data.data.map(response => GroupLoadDataResponse.transform(response))
    }
  }
}

export class SearchGroupsData extends PaginatedData {
  @ValidateIf((_, v) => v != null)
  @IsString()
  query?: string;
}

export class SearchGroupsResponse {
  groups: Group[];

  constructor(groups: Group[]) {
    this.groups = groups
  }

  static transform(data: SearchGroupsResponse) {
    return {
      groups: data.groups.map((group) => Group.transform(group))
    }
  }
}
