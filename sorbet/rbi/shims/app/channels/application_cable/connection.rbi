# typed: strong

class ApplicationCable::Connection
  sig { returns(T.nilable(User)) }
  attr_accessor :current_user

  sig { returns(T.nilable(Friend)) }
  attr_accessor :current_friend
end
