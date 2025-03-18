# typed: strict
# frozen_string_literal: true

class ApplicationPolicy < ActionPolicy::Base
  extend T::Sig
  extend T::Helpers

  # == Context
  # Configure additional authorization contexts here
  # (`user` is added by default).
  #
  #   authorize :account, optional: true
  #
  # Read more about authorization context: https://actionpolicy.evilmartians.io/#/authorization_context
  authorize :user, allow_nil: true
  authorize :friend, optional: true

  # == Pre-checks
  pre_check :allow_admins!

  # == Rules
  undef_method :create?

  sig { returns(T::Boolean) }
  def administrate? = false

  # == Scopes
  scope_matcher :frozen_record_relation, FrozenRecord::Scope

  relation_scope do |relation|
    if allowed_to?(:index?)
      relation
    else
      relation.none
    end
  end

  scope_for :frozen_record_relation do |relation|
    if allowed_to?(:index?)
      relation
    else
      relation.none
    end
  end

  private

  # == Helpers
  sig { void }
  def allow_admins!
    allow! if user&.admin?
  end

  sig { returns(User) }
  def user!
    user or deny!
  end

  sig { returns(Friend) }
  def friend!
    friend or deny!
  end
end
