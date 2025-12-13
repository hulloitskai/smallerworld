# typed: true
# frozen_string_literal: true

class PostStickersController < ApplicationController
  # == Filters ==

  before_action :authenticate_friend!, only: :create

  # == Actions ==

  # GET /posts/:post_id/stickers
  def index
    respond_to do |format|
      format.json do
        post = find_post!
        stickers = authorized_scope(post.stickers).chronological
        render(json: {
          stickers: PostStickerSerializer.many(stickers)
        })
      end
    end
  end

  # POST /posts/:post_id/stickers?friend_token=...
  def create
    respond_to do |format|
      format.json do
        current_friend = authenticate_friend!
        post = find_post!
        sticker_params = params.expect(sticker: [
          :id,
          :emoji,
          relative_position: %i[x y]
        ])
        sticker = post.stickers.create!(
          friend: current_friend,
          **sticker_params,
        )
        render(
          json: { sticker: PostStickerSerializer.one(sticker) },
          status: :created,
        )
      end
    end
  end

  # PUT/PATCH /post_stickers/:id
  def update
    respond_to do |format|
      format.json do
        sticker = find_sticker!
        authorize!(sticker)
        sticker.update!(params.expect(sticker: [ relative_position: %i[x y] ]))
        render(json: { sticker: PostStickerSerializer.one(sticker) })
      end
    end
  end

  # DELETE /post_stickers/:id
  def destroy
    respond_to do |format|
      format.json do
        sticker = find_sticker!
        authorize!(sticker)
        sticker.destroy!
        render(json: { "postId": sticker.post_id })
      end
    end
  end

  private

  # == Helpers ==

  sig { params(scope: Post::PrivateRelation).returns(Post) }
  def find_post!(scope: Post.all)
    scope.find(params.fetch(:post_id))
  end

  sig { params(scope: PostSticker::PrivateRelation).returns(PostSticker) }
  def find_sticker!(scope: PostSticker.all)
    scope.find(params.fetch(:id))
  end
end
