# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: posts
#
#  id              :uuid             not null, primary key
#  body_html       :text             not null
#  emoji           :string
#  hidden_from_ids :uuid             default([]), not null, is an Array
#  pinned_until    :datetime
#  title           :string
#  type            :string           not null
#  visibility      :string           not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  author_id       :uuid             not null
#  quoted_post_id  :uuid
#
# Indexes
#
#  index_posts_for_search          ((((to_tsvector('simple'::regconfig, COALESCE((emoji)::text, ''::text)) || to_tsvector('simple'::regconfig, COALESCE((title)::text, ''::text))) || to_tsvector('simple'::regconfig, COALESCE(body_html, ''::text))))) USING gin
#  index_posts_on_author_id        (author_id)
#  index_posts_on_hidden_from_ids  (hidden_from_ids)
#  index_posts_on_pinned_until     (pinned_until)
#  index_posts_on_quoted_post_id   (quoted_post_id)
#  index_posts_on_type             (type)
#  index_posts_on_visibility       (visibility)
#
# Foreign Keys
#
#  fk_rails_...  (author_id => users.id)
#  fk_rails_...  (quoted_post_id => posts.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class MaskedPost < Post
  extend T::Sig

  # == Attributes
  sig { override.returns(T.nilable(String)) }
  def title
    title = super or return
    mask_sentence(title)
  end

  sig { override.returns(String) }
  def body_html
    doc = Nokogiri::HTML5.fragment(super)
    doc.traverse do |node|
      # Mask text nodes
      if node.text?
        node.content = mask_sentence(node.content)
      end

      # Remove href attributes from all links
      if node.name == "a" && node.has_attribute?("href")
        node.remove_attribute("href")
      end
    end
    doc.to_html
  end

  sig { override.returns(String) }
  def reply_snippet = ""

  sig { override.returns(T.nilable(MaskedPost)) }
  def quoted_post
    post = super or return
    post.becomes(MaskedPost)
  end

  sig { override.returns(T::Array[MaskedImageModel]) }
  def images_models
    images_blobs.map { |blob| blob.becomes(MaskedImageModel) }
  end

  private

  # == Helpers
  sig { params(sentence: String).returns(String) }
  def mask_sentence(sentence)
    seed_faker_once
    counted = WordsCounted.count(sentence)
    Faker::Lorem.sentence(word_count: counted.token_count)
  end

  sig { void }
  def seed_faker_once
    return if @_faker_seeded

    Faker::Config.random = Random.new(created_at.to_i)
    @_faker_seeded = true
  end
end
