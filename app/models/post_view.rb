# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: post_views
#
#  id                   :uuid             not null, primary key
#  viewer_type          :string           not null
#  created_at           :datetime         not null
#  deprecated_friend_id :uuid
#  post_id              :uuid             not null
#  viewer_id            :uuid             not null
#
# Indexes
#
#  index_post_views_on_deprecated_friend_id  (deprecated_friend_id)
#  index_post_views_on_post_id               (post_id)
#  index_post_views_uniqueness               (viewer_type,viewer_id,post_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (post_id => posts.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class PostView < ApplicationRecord
  # == Associations ==

  belongs_to :post, inverse_of: :views
  belongs_to :viewer, polymorphic: true

  sig { returns(PostViewer) }
  def viewer!
    viewer or raise ActiveRecord::RecordNotFound, "Missing viewer"
  end

  # == Validations ==

  validates :post, uniqueness: { scope: :viewer }

  # == Scopes ==

  scope :with_viewer, -> { includes(:viewer) }
end
