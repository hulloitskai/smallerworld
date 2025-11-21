# typed: true
# frozen_string_literal: true

class PostSerializer < PostWithoutEncouragementSerializer
  # == Associations ==

  has_one :encouragement,
          serializer: PostEncouragementSerializer,
          nullable: true
end
