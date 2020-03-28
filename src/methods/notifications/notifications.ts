import { User } from "../../entities/user";
import { INotification, Notification, NotificationType } from "../../entities/notification";
import { AuthorizedMethod, NoRequestResponse } from "../utils";
import { MoreThan } from "typeorm";
import { SetNotificationsAsReadData } from "./_data";

export class NotificationMethods {
  static pushNotification = async (notificationData: INotification) => {
    const notification = new Notification(notificationData)

    await notification.save()
    return notification
  }

  static getNotifications = async (user: User, data: { skip: number, limit?: number, type?: NotificationType, from?: Date }) => {
    const skip = data.skip
    const take = data.limit ?? 20

    const type = data.type
    const from = data.from

    let query = Notification.createQueryBuilder('notification')
      .orderBy('notification.created', 'DESC')
      .where('notification.created > :from', { from })

    if (from) {
      query = query.where('notification.created > :from', { from })
    }

    if (type) {
      query = query.andWhere('notification.type = :type', { type })
    }


    const results = query.skip(skip).take(take).getMany()
    return results
  }

  static getNotificationCount = async (user: User, data: { unreadOnly?: boolean, groupId?: string, type?: NotificationType, from?: Date }) => {
    const groupId = data.groupId
    const type = data.type
    const from = data.from
    const unreadOnly = data.unreadOnly ?? true

    let query = Notification.createQueryBuilder('notification')
      .orderBy('notification.created', 'DESC')

    if (unreadOnly) {
      query = query.where('notification.read = :read', { read: false })
    }

    if (from) {
      query = query.andWhere('notification.created > :from', { from })
    }

    if (type) {
      query = query.andWhere('notification.type = :type', { type })
    }
    if (groupId) {
      query = query.andWhere('notification.groupId = :groupId', { groupId })
    }

    const results = query.getCount()
    return results
  }

  static setNotificationsAsRead: AuthorizedMethod<SetNotificationsAsReadData, NoRequestResponse> = async (user, data) => {
    await Notification.createQueryBuilder('notification')
      .update()
      .set({ read: true })
      .where('notification.read = :read', { read: false })
      .andWhere('notification.userId = :userId', { userId: user.id })
      .andWhere('notification.id IN (:...ids)', { ids: data.notifications })

    return {}
  }
}