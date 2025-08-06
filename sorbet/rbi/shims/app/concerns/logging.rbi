# typed: strong

module Logging
  sig { returns(T.any(ActiveSupport::Logger, ActiveSupport::BroadcastLogger)) }
  def logger; end

  sig { params(tags: String, block: T.proc.void).void }
  def tag_logger(*tags, &block); end
end
