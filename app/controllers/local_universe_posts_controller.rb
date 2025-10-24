# typed: true
# frozen_string_literal: true

class LocalUniversePostsController < ApplicationController
  # == Filters
  before_action :authenticate_user!

  # == Actions
  # GET /world/universe/posts
  def index
    current_user = authenticate_user!
    associated_friends = current_user
      .associated_friends
      .where.not(user_id: current_user.id)
    chosen_family_friends = associated_friends.chosen_family
    other_friends = associated_friends.where.not(chosen_family: true)
    posts = Post
      .with_quoted_post_and_attached_images
      .visible_to_public
      .where(id: Post.user_created.select(:id))
      .or(Post.where(author_id: current_user.id))
      .or(
        Post
          .where(author_id: other_friends.select(:user_id))
          .where("NOT hidden_from_ids && ARRAY(?)", other_friends.select(:id))
          .visible_to_friends,
      )
      .or(
        Post
          .where(author_id: chosen_family_friends.select(:user_id))
          .where(
            "NOT hidden_from_ids && ARRAY(?)", chosen_family_friends.select(:id)
          )
          .visible_to_chosen_family,
      )
    pagy, paginated_posts = pagy_keyset(
      posts.order(created_at: :desc, id: :asc),
      limit: 5,
    )
    associated_friends_by_user_id = associated_friends
      .select(:user_id, :access_token)
      .index_by(&:user_id)
    local_universe_posts = paginated_posts.map do |post|
      associated_friend = associated_friends_by_user_id[post.author_id]
      LocalUniversePost.new(
        post:,
        associated_friend_access_token: associated_friend&.access_token,
      )
    end
    render(json: {
      posts: LocalUniversePostSerializer.many(local_universe_posts),
      pagination: {
        next: pagy.next,
      },
    })
  end
end
