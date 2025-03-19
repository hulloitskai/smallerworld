# typed: true
# frozen_string_literal: true

class MaskedPost < T::Struct
  extend T::Sig

  # == Properties
  const :post, Post
  delegate_missing_to :post

  # == Initialize
  sig { params(post: Post).void }
  def initialize(post:)
    super
    Faker::Config.random = Random.new(post.created_at.to_i)
  end

  # == Attributes
  def title
    if (title = post.title)
      mask_sentence(title)
    end
  end

  def body_html
    doc = Nokogiri::HTML5.fragment(post.body_html)
    doc.traverse do |node|
      node.content = mask_sentence(node.content) if node.text?
    end
    doc.to_html
  end

  def reply_snippet = ""
  def image_blob = nil

  private

  # == Helpers
  sig { params(sentence: String).returns(String) }
  def mask_sentence(sentence)
    counted = WordsCounted.count(sentence)
    Faker::Lorem.sentence(word_count: counted.token_count)
  end
end
