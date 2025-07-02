# typed: true
# frozen_string_literal: true

class Post
  class BodyFormatter
    extend T::Sig
    include Singleton
    include ActionView::Helpers::TextHelper

    sig { params(text: String).returns(String) }
    def self.text_to_html(text)
      instance.simple_format(text)
    end
  end
end
