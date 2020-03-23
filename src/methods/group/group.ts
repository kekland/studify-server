import { IsNotEmpty } from "class-validator";
import { GroupGetResponse, GroupGetData } from "./_data";
import { UnauthorizedMethod } from "../utils";
import { Group } from "../../entities/group";

export class GroupMethods {
  static async getGroupById(id: string): Promise<Group | undefined> {
    const group = await Group.findOne(id)
    return group
  }

  static getGroup: UnauthorizedMethod<GroupGetData, GroupGetResponse> = async (data) => {
    const group = await GroupMethods.getGroupById(data.id)
    return new GroupGetResponse(group)
  }
}
