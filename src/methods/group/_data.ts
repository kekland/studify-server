import { MinLength, IsNotEmpty, IsNumber } from "class-validator";
import { Group } from "../../entities/group";
import { Message } from "../../entities/message";

export class GroupCreateData {
  @MinLength(6)
  name!: string;

  @IsNotEmpty()
  description!: string;

  @IsNumber()
  colorId!: number;
}

export class GroupUpdateData {
  @IsNotEmpty()
  id!: string;

  @MinLength(6)
  name!: string;

  @IsNotEmpty()
  description!: string;

  @IsNumber()
  colorId!: number;
}

export class GroupGetData {
  @IsNotEmpty()
  id!: string;
}

export class GroupGetResponse {
  group: Group | undefined;

  constructor(group: Group | undefined) {
    this.group = group
  }

  static transform(data: GroupGetResponse) {
    return {
      group: data.group? Group.transform(data.group) : undefined,
    }
  }
}