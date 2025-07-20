# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: post_shares
#
#  id          :uuid             not null, primary key
#  sharer_type :string           not null
#  created_at  :datetime         not null
#  post_id     :uuid             not null
#  sharer_id   :uuid             not null
#
# Indexes
#
#  index_post_shares_on_post_id  (post_id)
#  index_post_shares_on_sharer   (sharer_type,sharer_id)
#  index_post_shares_uniqueness  (post_id,sharer_id,sharer_type) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (post_id => posts.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class PostShare < ApplicationRecord
  # == Associations
  belongs_to :post
  has_one :post_author, through: :post, source: :author
  belongs_to :sharer, polymorphic: true

  sig { override.returns(T.nilable(T.any(User, Friend))) }
  def sharer
    super
  end

  sig { override.params(value: T.nilable(T.any(User, Friend))).void }
  def sharer=(value)
    super
  end

  sig { returns(T.any(User, Friend)) }
  def sharer!
    sharer or raise ActiveRecord::RecordNotFound, "Missing post sharer"
  end

  sig { returns(Post) }
  def post!
    post or raise ActiveRecord::RecordNotFound, "Missing associated post"
  end

  sig { returns(User) }
  def post_author!
    post_author or raise ActiveRecord::RecordNotFound, "Missing post author"
  end

  # == Validations
  validates :sharer_type, inclusion: { in: %w[User Friend] }

  # == Methods
  sig { returns(String) }
  def share_snippet
    post!.snippet + "\n> \n> (see full post) [#{shortlink_url}]\n\n"
  end

  sig { returns(String) }
  def shortlink_url
    options = ShortlinkService.shortlink_url_options
    Rails.application.routes.url_helpers.post_share_url(self, **options)
  end
end
