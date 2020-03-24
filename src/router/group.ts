import { Router, Request, Response } from 'express'
import { generateEndpoint, generateUnauthorizedMethodEndpoint, generateAuthorizedMethodEndpoint } from './utils'
import { Group } from '../entities/group'
import { GroupUpdateData, GroupCreateData, GroupGetData, GroupGetResponse, GroupGetMultipleResponse, GroupGetAllData, GroupJoinData, GroupJoinResponse, GroupLeaveResponse, GroupLeaveData, GroupGetUsersResponse } from '../methods/group/_data'
import { GroupMethods } from '../methods/group/group'
import { GroupAdminMethods } from '../methods/group/group_admin'
import { PaginatedData, GetMessagesResponse } from '../methods/messaging/_data'
import { MessagingMethods } from '../methods/messaging/messaging'
import { ClassType } from "class-transformer/ClassTransformer";

const getGroup = generateUnauthorizedMethodEndpoint<GroupGetData, GroupGetResponse>(GroupMethods.getGroup, {
  inputClass: GroupGetData,
  validateUser: false,
  validateBody: false,
}, GroupGetResponse.transform)

const getAllGroups = generateUnauthorizedMethodEndpoint<GroupGetAllData, GroupGetMultipleResponse>(GroupMethods.getGroups, {
  inputClass: GroupGetAllData,
  validateBody: false,
}, GroupGetMultipleResponse.transform)

const createGroup = generateAuthorizedMethodEndpoint<GroupCreateData, Group>(GroupAdminMethods.createGroup, {
  inputClass: GroupCreateData,
  populateUser: true,
}, Group.transform)

const updateGroup = generateAuthorizedMethodEndpoint<GroupUpdateData, Group>(GroupAdminMethods.updateGroup, {
  inputClass: GroupUpdateData,
}, Group.transform)

const getMessages = generateAuthorizedMethodEndpoint<PaginatedData, GetMessagesResponse>(MessagingMethods.getMessages, {
  inputClass: PaginatedData,
  populateUser: true
}, GetMessagesResponse.transform)

const getUsers = generateAuthorizedMethodEndpoint<PaginatedData, GroupGetUsersResponse>(GroupMethods.getGroupUsers, {
  inputClass: PaginatedData,
  populateUser: true
}, GroupGetUsersResponse.transform)

const joinGroup = generateAuthorizedMethodEndpoint<GroupJoinData, GroupJoinResponse>(GroupMethods.joinGroup, {
  inputClass: GroupJoinData,
  populateUser: true
}, GroupJoinResponse.transform)

const leaveGroup = generateAuthorizedMethodEndpoint<GroupLeaveData, GroupLeaveResponse>(GroupMethods.leaveGroup, {
  inputClass: GroupLeaveData,
  populateUser: true
}, GroupLeaveResponse.transform)

export const groupRouter: () => Router = () => {
  const router = Router()

  router.get('/all', getAllGroups)
  router.get('/:groupId/users', getUsers)
  router.get('/:groupId/messages', getMessages)
  router.get('/:groupId', getGroup)
  router.post('/create', createGroup)
  router.post('/:groupId/join', joinGroup)
  router.post('/:groupId/leave', leaveGroup)
  router.put('/:groupId/update', updateGroup)

  return router
}