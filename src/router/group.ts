import { Router, Request, Response } from 'express'
import { generateEndpoint, generateUnauthorizedMethodEndpoint, generateAuthorizedMethodEndpoint } from './utils'
import { Group } from '../entities/group'
import { GroupUpdateData, GroupCreateData, GroupGetData, GroupGetResponse } from '../methods/group/_data'
import { GroupMethods } from '../methods/group/group'
import { GroupAdminMethods } from '../methods/group/group_admin'

const getGroup = generateUnauthorizedMethodEndpoint<GroupGetData, GroupGetResponse>(GroupMethods.getGroup, {
  inputClass: GroupGetData,
  validateUser: false,
}, GroupGetResponse.transform)

const createGroup = generateAuthorizedMethodEndpoint<GroupCreateData, Group>(GroupAdminMethods.createGroup, {
  inputClass: GroupCreateData,
  populateUser: true,
}, Group.transform)

const updateGroup = generateAuthorizedMethodEndpoint<GroupUpdateData, Group>(GroupAdminMethods.updateGroup, {
  inputClass: GroupUpdateData,
}, Group.transform)

export const groupRouter: () => Router = () => {
  const router = Router()

  router.get('/', getGroup)
  router.post('/', createGroup)
  router.put('/', updateGroup)

  return router
}