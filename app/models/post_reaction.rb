# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: post_reactions
#
#  id                   :uuid             not null, primary key
#  emoji                :string           not null
#  reactor_type         :string           not null
#  created_at           :datetime         not null
#  deprecated_friend_id :uuid
#  post_id              :uuid             not null
#  reactor_id           :uuid             not null
#
# Indexes
#
#  index_post_reactions_on_deprecated_friend_id  (deprecated_friend_id)
#  index_post_reactions_on_post_id               (post_id)
#  index_post_reactions_on_reactor               (reactor_type,reactor_id)
#  index_post_reactions_uniqueness               (reactor_type,reactor_id,post_id,emoji) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (post_id => posts.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class PostReaction < ApplicationRecord
  include Noticeable

  # == Associations ==

  belongs_to :post, inverse_of: :reactions
  has_one :post_author, through: :post, source: :author
  belongs_to :reactor, polymorphic: true

  sig { returns(Post) }
  def post!
    post or raise ActiveRecord::RecordNotFound, "Missing associated post"
  end

  sig { returns(PostReactor) }
  def reactor!
    reactor or raise ActiveRecord::RecordNotFound, "Missing reactor"
  end

  sig { returns(User) }
  def post_author!
    post_author or raise ActiveRecord::RecordNotFound, "Missing post author"
  end

  # == Validations ==

  validates :reactor_type, inclusion: { in: %w[User Friend] }
  validates :emoji,
            presence: true,
            uniqueness: { scope: %i[post reactor], message: "already added" }

  # == Callbacks ==

  after_create :create_notification!, unless: :reactor_already_reacted_to_post?

  # == Noticeable ==

  sig { override.params(recipient: Notifiable).returns(NotificationMessage) }
  def notification_message(recipient:)
    case recipient
    when User
      reactor = reactor!
      NotificationMessage.new(
        title: "#{emoji} from #{reactor.name}",
        body: post!.compact_snippet,
        target_url: Rails.application.routes.url_helpers.user_world_path(
          post_id:,
          trailing_slash: true,
        ),
      )
    else
      raise "Invalid notification recipient: #{recipient.inspect}"
    end
  end

  # == Methods ==

  sig { void }
  def create_notification!
    notifications.create!(recipient: post_author!)
  end

  private

  # == Helpers ==

  sig { returns(T::Boolean) }
  def reactor_already_reacted_to_post?
    reactions = post!.reactions
    if (id = self[:id])
      reactions = reactions.where.not(id:)
    end
    reactions.exists?(reactor: reactor!)
  end
end
