# typed: true
# frozen_string_literal: true

class SpacePost < T::Struct
  extend T::Sig

  const :post, T.any(Post, MaskedPost)
  delegate :author, to: :post

  const :repliers, Integer
  const :replied, T::Boolean
  const :seen, T::Boolean
  const :reply_to_number, T.nilable(String)

  # == Author ==

  sig { returns(String) }
  def author_name
    if (name = post.pen_name)
      name
    else
      author.name
    end
  end

  sig { returns(T.nilable(World)) }
  def author_world
    if !post.pen_name? && (world = author.world)
      world
    end
  end
end
