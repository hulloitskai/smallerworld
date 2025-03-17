# typed: strong

class ApplicationCable::Channel
  sig { returns(T.nilable(User)) }
  attr_reader :current_user

  sig { returns(T.nilable(Friend)) }
  attr_reader :current_friend

  sig { returns(ApplicationCable::Connection) }
  def connection; end
end
