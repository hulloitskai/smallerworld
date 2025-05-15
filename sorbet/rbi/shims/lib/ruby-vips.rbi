# typed: strong

module Vips
  class Image
    sig { params(name: String, opts: T.untyped).returns(Image) }
    def self.new_from_file(name, **opts); end
  end
end
