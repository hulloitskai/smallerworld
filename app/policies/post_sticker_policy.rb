# typed: true
# frozen_string_literal: true

class PostStickerPolicy < RelaxedPolicy
  # == Rules ==

  def manage?
    sticker = T.cast(record, PostSticker)
    sticker.friend! == friend!
  end
end
