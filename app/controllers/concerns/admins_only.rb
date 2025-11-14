# typed: true
# frozen_string_literal: true

module AdminsOnly
  extend T::Sig
  extend T::Helpers
  extend ActiveSupport::Concern

  include AuthenticatesUsers

  requires_ancestor { ActionController::Base }

  included do
    T.bind(self, T.class_of(ActionController::Base))

    # == Filters ==

    before_action :authorize_admins!
  end

  private

  # == Filter Handlers ==

  sig { void }
  def authorize_admins!
    current_user = authenticate_user!
    authorize!(current_user, to: :administrate?)
  end
end
