import { Router, Request, Response } from 'express'
import { generateEndpoint, generateUnauthorizedMethodEndpoint, generateAuthorizedMethodEndpoint } from './utils'
import { Group } from '../entities/group'
import { GroupUpdateData, GroupCreateData, GroupGetData, GroupGetResponse, GroupGetMultipleResponse } from '../methods/group/_data'
import { GroupMethods } from '../methods/group/group'
import { GroupAdminMethods } from '../methods/group/group_admin'
import { GetMessagesData, GetMessagesResponse } from '../methods/messaging/_data'
import { MessagingMethods } from '../methods/messaging/messaging'

const getGroup = generateUnauthorizedMethodEndpoint<GroupGetData, GroupGetResponse>(GroupMethods.getGroup, {
  inputClass: GroupGetData,
  validateUser: false,
}, GroupGetResponse.transform)

const getAllGroups = generateUnauthorizedMethodEndpoint<{}, GroupGetMultipleResponse>(GroupMethods.getGroups, {
  validateBody: false,
  validateUser: false,
}, GroupGetMultipleResponse.transform)

const createGroup = generateAuthorizedMethodEndpoint<GroupCreateData, Group>(GroupAdminMethods.createGroup, {
  inputClass: GroupCreateData,
  populateUser: true,
}, Group.transform)

const updateGroup = generateAuthorizedMethodEndpoint<GroupUpdateData, Group>(GroupAdminMethods.updateGroup, {
  inputClass: GroupUpdateData,
}, Group.transform)

const getMessages = generateAuthorizedMethodEndpoint<GetMessagesData, GetMessagesResponse>(MessagingMethods.getMessages, {
  inputClass: GetMessagesData,
}, GetMessagesResponse.transform)

export const groupRouter: () => Router = () => {
  const router = Router()

  router.get('/', getGroup)
  router.get('/all', getAllGroups)
  router.get('/messages', getMessages)
  router.post('/', createGroup)
  router.put('/', updateGroup)

  return router
}