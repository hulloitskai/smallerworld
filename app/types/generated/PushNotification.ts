// TypesFromSerializers CacheKey 43e56579c6859c80c4b83c71e79fd7b7
//
// DO NOT MODIFY: This file was automatically generated by TypesFromSerializers.
import type NotificationType from '../NotificationType'

export default interface PushNotification {
  id: string
  delivery_token: string | null
  payload: Record<string, any>
  timestamp: string
  type: NotificationType
}
