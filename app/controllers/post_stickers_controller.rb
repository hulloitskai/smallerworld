# typed: true
# frozen_string_literal: true

class PostStickersController < ApplicationController
  # == Filters
  before_action :authenticate_friend!, only: :create

  # == Actions
  # GET /posts/:post_id/stickers
  def index
    post = load_post
    stickers = authorized_scope(post.stickers).chronological
    render(json: {
      stickers: PostStickerSerializer.many(stickers),
    })
  end

  # POST /posts/:post_id/stickers?friend_token=...
  def create
    current_friend = authenticate_friend!
    post = load_post
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
    sticker = load_sticker
    authorize!(sticker)
    sticker.update!(params.expect(sticker: [relative_position: %i[x y]]))
    render(json: { sticker: PostStickerSerializer.one(sticker) })
  end

  # DELETE /post_stickers/:id
  def destroy
    sticker = load_sticker
    authorize!(sticker)
    sticker.destroy!
    render(json: { "postId": sticker.post_id })
  end

  private

  # == Helpers
  sig { params(scope: Post::PrivateRelation).returns(Post) }
  def load_post(scope: Post.all)
    scope.find(params.fetch(:post_id))
  end

  sig { params(scope: PostSticker::PrivateRelation).returns(PostSticker) }
  def load_sticker(scope: PostSticker.all)
    scope.find(params.fetch(:id))
  end
end
