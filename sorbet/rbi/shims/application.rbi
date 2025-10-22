# typed: true

module Rails
  class << self
    sig { returns(SmallerWorld::Application) }
    def application; end
  end
end
