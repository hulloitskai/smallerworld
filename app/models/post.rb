# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: posts
#
#  id         :uuid             not null, primary key
#  body_html  :text             not null
#  emoji      :string           not null
#  title      :string
#  type       :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  author_id  :uuid             not null
#
# Indexes
#
#  index_posts_on_author_id  (author_id)
#  index_posts_on_type       (type)
#
# Foreign Keys
#
#  fk_rails_...  (author_id => users.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class Post < ApplicationRecord
  include Noticeable

  self.inheritance_column = nil

  # == Attributes
  enumerize :type, in: %i[journal_entry poem invitation question]

  sig { returns(String) }
  def body_text
    content = Nokogiri::HTML5.fragment(body_html)
    reshape_content_for_text_rendering(content)
    Html2Text.new(content).convert
  end

  sig { returns(T.nilable(String)) }
  def title_snippet
    title&.truncate(34)
  end

  sig { returns(String) }
  def body_snippet
    body_text.truncate(80)
  end

  sig { returns(String) }
  def reply_snippet
    "> " + body_text.truncate(80).split("\n").join("\n >") + "\n\n"
  end

  # == Associations
  belongs_to :author, class_name: "User"

  sig { returns(User) }
  def author!
    author or raise ActiveRecord::RecordNotFound, "Missing author"
  end

  # == Normalizations
  normalizes :title, with: ->(title) { title&.strip }

  # == Validations
  validates :type, :body_html, presence: true
  validates :title, presence: true, allow_nil: true

  # == Callbacks
  after_create :notify_friends!

  # == Noticeable
  sig do
    override
      .params(recipient: T.all(ActiveRecord::Base, Notifiable))
      .returns(T::Hash[String, T.untyped])
  end
  def notification_payload(recipient)
    payload = PostNotificationPayload.new(post: self)
    PostNotificationPayloadSerializer.one(payload)
  end

  # == Methods
  sig { void }
  def notify_friends!
    transaction do
      Friend.where(user_id: author_id).select(:id).find_each do |friend|
        notifications.create!(recipient: friend)
      end
    end
  end

  sig { returns(Friend::PrivateRelation) }
  def friends_reached
    Friend.where(id: notifications.to_friends.delivered.select(:recipient_id))
  end

  private

  # == Helpers
  sig { overridable.params(content: Nokogiri::HTML5::DocumentFragment).void }
  def reshape_content_for_text_rendering(content)
    content.css("li").each do |li|
      child = li.first_element_child
      child.replace("span") if child.name == "p"
    end
  end
end
