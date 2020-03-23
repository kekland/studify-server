import { GroupGetResponse, GroupGetData, GroupGetMultipleResponse } from "./_data";
import { UnauthorizedMethod } from "../utils";
import { Group } from "../../entities/group";

export class GroupMethods {
  static async getGroupById(id: string): Promise<Group | undefined> {
    const group = await Group.findOne(id)
    return group
  }

  static async getAllGroups(): Promise<Group[]> {
    const groups = await Group.find()
    return groups
  }

  static getGroup: UnauthorizedMethod<GroupGetData, GroupGetResponse> = async (data) => {
    const group = await GroupMethods.getGroupById(data.id)
    return new GroupGetResponse(group)
  }

  static getGroups: UnauthorizedMethod<{}, GroupGetMultipleResponse> = async (data) => {
    const groups = await GroupMethods.getAllGroups()
    return new GroupGetMultipleResponse(groups)
  }
}
