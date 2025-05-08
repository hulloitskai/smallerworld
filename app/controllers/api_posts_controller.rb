# typed: true
# frozen_string_literal: true

class ApiPostsController < ApiController
  # == Actions
  # POST /api/posts
  def create
    current_user = api_user!
    post_params = params.permit(%i[
      type
      emoji
      visibility
      title
      body_text
      body_html
    ])
    post_params[:type] ||= "journal_entry"
    post_params[:visibility] ||= "friends"

    post = current_user.posts.build(**post_params)
    if post.save
      render(json: { post: WorldPostSerializer.one(post) }, status: :created)
    else
      errors = post.form_errors
      if post_params.include?(:body_text) && post_params.exclude?(:body_html) &&
          (message = errors.delete("body_html"))
        errors["body_text"] = message
      end
      render(json: { errors: }, status: :unprocessable_entity)
    end
  end
end
