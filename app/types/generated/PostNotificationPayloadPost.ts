// TypesFromSerializers CacheKey 8e710aabdc32672a546521ff4420058c
//
// DO NOT MODIFY: This file was automatically generated by TypesFromSerializers.
import type PostType from '../PostType'

export default interface PostNotificationPayloadPost {
  id: string
  body_snippet: string
  emoji: string
  image_src: string | null
  title_snippet: string | null
  type: PostType
}
