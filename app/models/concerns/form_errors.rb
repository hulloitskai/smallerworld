# typed: strict
# frozen_string_literal: true

module FormErrors
  extend T::Sig
  extend T::Helpers
  extend ActiveSupport::Concern

  abstract!

  # == Interface
  sig { abstract.returns(ActiveModel::Errors) }
  def errors; end

  # == Methods
  sig { returns(T::Hash[String, String]) }
  def form_errors
    errors = {}
    self.errors.attribute_names.each do |name|
      messages = self.errors.messages_for(name)
      errors[name.to_s] = messages.first!
    end
    errors
  end
end
