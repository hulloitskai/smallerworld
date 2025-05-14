# typed: true
# frozen_string_literal: true

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
