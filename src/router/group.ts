import { Router, Request, Response } from 'express'
import { generateEndpoint, generateUnauthorizedMethodEndpoint, generateAuthorizedMethodEndpoint } from './utils'
import { Group } from '../entities/group'
import { GroupUpdateData, GroupCreateData, GroupGetData, GroupGetResponse, GroupGetMultipleResponse, GroupGetAllData, GroupJoinData, GroupJoinResponse, GroupLeaveResponse, GroupLeaveData, GroupGetUsersResponse, GroupLoadDataResponse, GroupLoadAllDataResponse, SearchGroupsData } from '../methods/group/_data'
import { GroupMethods } from '../methods/group/group'
import { GroupAdminMethods } from '../methods/group/group_admin'
import { PaginatedData, GetMessagesResponse } from '../methods/messaging/_data'
import { MessagingMethods } from '../methods/messaging/messaging'
import { ClassType } from "class-transformer/ClassTransformer";
import { NoRequestData } from '../methods/utils'
import { NotificationMethods } from '../methods/notifications/notifications'
import { SetGroupAsReadData } from '../methods/notifications/_data'

const getGroup = generateUnauthorizedMethodEndpoint(GroupMethods.getGroup, {
  inputClass: GroupGetData,
  validateUser: false,
  validateBody: false,
}, GroupGetResponse.transform)

const getAllGroups = generateUnauthorizedMethodEndpoint(GroupMethods.getGroups, {
  inputClass: GroupGetAllData,
  validateBody: false,
}, GroupGetMultipleResponse.transform)

const createGroup = generateAuthorizedMethodEndpoint(GroupAdminMethods.createGroup, {
  inputClass: GroupCreateData,
  populateUser: true,
}, Group.transform)

const updateGroup = generateAuthorizedMethodEndpoint(GroupAdminMethods.updateGroup, {
  inputClass: GroupUpdateData,
}, Group.transform)

const getMessages = generateAuthorizedMethodEndpoint(MessagingMethods.getMessages, {
  inputClass: PaginatedData,
  populateUser: true
}, GetMessagesResponse.transform)

const getUsers = generateAuthorizedMethodEndpoint(GroupMethods.getGroupUsers, {
  inputClass: PaginatedData,
  populateUser: true
}, GroupGetUsersResponse.transform)

const joinGroup = generateAuthorizedMethodEndpoint(GroupMethods.joinGroup, {
  inputClass: GroupJoinData,
  populateUser: true
}, GroupJoinResponse.transform)

const leaveGroup = generateAuthorizedMethodEndpoint(GroupMethods.leaveGroup, {
  inputClass: GroupLeaveData,
  populateUser: true
}, GroupLeaveResponse.transform)

const loadData = generateAuthorizedMethodEndpoint(GroupMethods.loadData, {
  inputClass: NoRequestData,
  populateUser: true
}, GroupLoadDataResponse.transform)

const loadAllData = generateAuthorizedMethodEndpoint(GroupMethods.loadAllData, {
  inputClass: NoRequestData,
  populateUser: true
}, GroupLoadAllDataResponse.transform)

const setGroupAsRead = generateAuthorizedMethodEndpoint(NotificationMethods.setGroupAsRead, {
  inputClass: NoRequestData,
  validateBody: true,
})

const searchGroups = generateUnauthorizedMethodEndpoint(GroupMethods.searchGroups, {
  inputClass: SearchGroupsData,
  validateBody: true,
  validateUser: false,
})

export const groupRouter: () => Router = () => {
  const router = Router()

  router.get('/all', getAllGroups)
  router.get('/search', searchGroups)
  router.get('/loadAllData', loadAllData)
  router.get('/:groupId/loadData', loadData)
  router.get('/:groupId/users', getUsers)
  router.get('/:groupId/messages', getMessages)
  router.get('/:groupId', getGroup)
  router.post('/create', createGroup)
  router.post('/:groupId/join', joinGroup)
  router.post('/:groupId/leave', leaveGroup)
  router.post('/:groupId/setAsRead', setGroupAsRead)
  router.put('/:groupId/update', updateGroup)

  return router
}