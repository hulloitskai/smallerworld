# typed: strict
# frozen_string_literal: true

module PostReplier
  extend T::Sig
  extend T::Helpers
  extend ActiveSupport::Concern

  abstract!
  requires_ancestor { ActiveRecord::Base }

  # == Type Aliases ==

  included do
    T.bind(self, T.class_of(ActiveRecord::Base))

    # == Associations ==

    has_many :post_reply_receipts, as: :replier, dependent: :destroy
  end

  # == Interface ==

  sig { abstract.returns(String) }
  def name; end
end
