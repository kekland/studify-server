import { Router, Request, Response } from 'express'
import { validateRequest } from '../validation/validation'
import * as GroupMethods from '../methods/group'
import * as GroupAdminMethods from '../methods/group_admin'
import { generateEndpoint, generateUnauthorizedMethodEndpoint, generateAuthorizedMethodEndpoint } from './utils'
import { Group } from '../classes/group'

const getGroup = generateUnauthorizedMethodEndpoint<GroupMethods.GroupGetData, Group | null>(GroupMethods.getGroup, {
  inputClass: GroupMethods.GroupGetData,
  validateUser: false,
})

const createGroup = generateAuthorizedMethodEndpoint<GroupAdminMethods.GroupCreateData, Group>(GroupAdminMethods.createGroup, {
  inputClass: GroupAdminMethods.GroupCreateData,
})

const updateGroup = generateAuthorizedMethodEndpoint<GroupAdminMethods.GroupUpdateData, Group>(GroupAdminMethods.updateGroup, {
  inputClass: GroupAdminMethods.GroupUpdateData,
})

export const groupRouter: () => Router = () => {
  const router = Router()

  router.get('/', getGroup)
  router.post('/', createGroup)
  router.put('/', updateGroup)

  return router
}