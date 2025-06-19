# typed: true
# frozen_string_literal: true

class PostStickersController < ApplicationController
  # == Filters
  before_action :authenticate_friend!, only: :create

  # == Actions
  # GET /posts/:post_id/stickers
  def index
    post = find_post
    stickers = authorized_scope(post.stickers).chronological
    render(json: {
      stickers: PostStickerSerializer.many(stickers),
    })
  end

  # POST /posts/:post_id/stickers?friend_token=...
  def create
    current_friend = authenticate_friend!
    post = find_post
    sticker_params = params.expect(sticker: [
      :id,
      :emoji,
      relative_position: %i[x y],
    ])
    sticker = post.stickers.create!(friend: current_friend, **sticker_params)
    render(
      json: { sticker: PostStickerSerializer.one(sticker) },
      status: :created,
    )
  end

  # PUT/PATCH /post_stickers/:id
  def update
    sticker = find_sticker
    authorize!(sticker)
    sticker.update!(params.expect(sticker: [relative_position: %i[x y]]))
    render(json: { sticker: PostStickerSerializer.one(sticker) })
  end

  # DELETE /post_stickers/:id
  def destroy
    sticker = find_sticker
    authorize!(sticker)
    sticker.destroy!
    render(json: { "postId": sticker.post_id })
  end

  private

  # == Helpers
  sig { returns(Post) }
  def find_post
    Post.find(params.fetch(:post_id))
  end

  sig { returns(PostSticker) }
  def find_sticker
    PostSticker.find(params.fetch(:id))
  end
end
