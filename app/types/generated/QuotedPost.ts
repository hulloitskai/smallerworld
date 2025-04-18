// TypesFromSerializers CacheKey 9202b49cc99a44e63a4d1ad935afec60
//
// DO NOT MODIFY: This file was automatically generated by TypesFromSerializers.
import type PostType from '../PostType'
import type Image from './Image'

export default interface QuotedPost {
  id: string
  body_html: string
  created_at: string
  emoji: string
  image: Image | null
  pinned_until: string | null
  title: string | null
  type: PostType
}
