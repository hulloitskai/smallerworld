# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `rails-healthcheck` gem.
# Please instead update this file by running `bin/tapioca gem rails-healthcheck`.


# source://rails-healthcheck//lib/healthcheck/version.rb#3
module Healthcheck
  private

  # source://rails-healthcheck//lib/healthcheck.rb#32
  def check; end

  # source://rails-healthcheck//lib/healthcheck.rb#24
  def configuration; end

  # source://rails-healthcheck//lib/healthcheck.rb#20
  def configure; end

  # source://rails-healthcheck//lib/healthcheck.rb#36
  def custom!(controller); end

  # source://rails-healthcheck//lib/healthcheck.rb#40
  def custom?; end

  # source://rails-healthcheck//lib/healthcheck.rb#28
  def routes(router); end

  class << self
    # source://rails-healthcheck//lib/healthcheck.rb#32
    def check; end

    # source://rails-healthcheck//lib/healthcheck.rb#24
    def configuration; end

    # @yield [configuration]
    #
    # source://rails-healthcheck//lib/healthcheck.rb#20
    def configure; end

    # source://rails-healthcheck//lib/healthcheck.rb#36
    def custom!(controller); end

    # @return [Boolean]
    #
    # source://rails-healthcheck//lib/healthcheck.rb#40
    def custom?; end

    # source://rails-healthcheck//lib/healthcheck.rb#28
    def routes(router); end
  end
end

# source://rails-healthcheck//lib/healthcheck.rb#16
Healthcheck::CONTROLLER_ACTION = T.let(T.unsafe(nil), String)

# source://rails-healthcheck//lib/healthcheck/check.rb#4
class Healthcheck::Check
  # @return [Check] a new instance of Check
  #
  # source://rails-healthcheck//lib/healthcheck/check.rb#7
  def initialize(name, block); end

  # Returns the value of attribute block.
  #
  # source://rails-healthcheck//lib/healthcheck/check.rb#5
  def block; end

  # Sets the attribute block
  #
  # @param value the value to set the attribute block to.
  #
  # source://rails-healthcheck//lib/healthcheck/check.rb#5
  def block=(_arg0); end

  # source://rails-healthcheck//lib/healthcheck/check.rb#12
  def execute!; end

  # Returns the value of attribute name.
  #
  # source://rails-healthcheck//lib/healthcheck/check.rb#5
  def name; end

  # Sets the attribute name
  #
  # @param value the value to set the attribute name to.
  #
  # source://rails-healthcheck//lib/healthcheck/check.rb#5
  def name=(_arg0); end
end

# source://rails-healthcheck//lib/healthcheck/checker.rb#4
class Healthcheck::Checker
  # @return [Checker] a new instance of Checker
  #
  # source://rails-healthcheck//lib/healthcheck/checker.rb#7
  def initialize; end

  # source://rails-healthcheck//lib/healthcheck/checker.rb#11
  def check; end

  # @return [Boolean]
  #
  # source://rails-healthcheck//lib/healthcheck/checker.rb#18
  def errored?; end

  # Returns the value of attribute errors.
  #
  # source://rails-healthcheck//lib/healthcheck/checker.rb#5
  def errors; end

  # Sets the attribute errors
  #
  # @param value the value to set the attribute errors to.
  #
  # source://rails-healthcheck//lib/healthcheck/checker.rb#5
  def errors=(_arg0); end

  private

  # source://rails-healthcheck//lib/healthcheck/checker.rb#24
  def execute(check); end
end

# source://rails-healthcheck//lib/healthcheck/configuration.rb#4
class Healthcheck::Configuration
  # @return [Configuration] a new instance of Configuration
  #
  # source://rails-healthcheck//lib/healthcheck/configuration.rb#9
  def initialize; end

  # source://rails-healthcheck//lib/healthcheck/configuration.rb#13
  def add_check(name, block); end

  # source://rails-healthcheck//lib/healthcheck/configuration.rb#7
  def checks; end

  # source://rails-healthcheck//lib/healthcheck/configuration.rb#7
  def checks=(_arg0); end

  # source://rails-healthcheck//lib/healthcheck/configuration.rb#17
  def clear!; end

  # source://rails-healthcheck//lib/healthcheck/configuration.rb#7
  def custom; end

  # source://rails-healthcheck//lib/healthcheck/configuration.rb#7
  def custom=(_arg0); end

  # source://rails-healthcheck//lib/healthcheck/configuration.rb#7
  def error; end

  # source://rails-healthcheck//lib/healthcheck/configuration.rb#7
  def error=(_arg0); end

  # source://rails-healthcheck//lib/healthcheck/configuration.rb#7
  def method; end

  # source://rails-healthcheck//lib/healthcheck/configuration.rb#7
  def method=(_arg0); end

  # source://rails-healthcheck//lib/healthcheck/configuration.rb#7
  def route; end

  # source://rails-healthcheck//lib/healthcheck/configuration.rb#7
  def route=(_arg0); end

  # source://rails-healthcheck//lib/healthcheck/configuration.rb#7
  def success; end

  # source://rails-healthcheck//lib/healthcheck/configuration.rb#7
  def success=(_arg0); end

  # source://rails-healthcheck//lib/healthcheck/configuration.rb#7
  def verbose; end

  # source://rails-healthcheck//lib/healthcheck/configuration.rb#7
  def verbose=(_arg0); end
end

# source://rails-healthcheck//lib/healthcheck/configuration.rb#5
Healthcheck::Configuration::SETTINGS = T.let(T.unsafe(nil), Array)

# source://rails-healthcheck//lib/healthcheck/engine.rb#6
class Healthcheck::Engine < ::Rails::Engine
  class << self
    private

    # source://activesupport/8.0.1/lib/active_support/class_attribute.rb#15
    def __class_attr___callbacks; end

    # source://activesupport/8.0.1/lib/active_support/class_attribute.rb#17
    def __class_attr___callbacks=(new_value); end
  end
end

# source://rails-healthcheck//lib/healthcheck/error.rb#4
class Healthcheck::Error
  # @return [Error] a new instance of Error
  #
  # source://rails-healthcheck//lib/healthcheck/error.rb#7
  def initialize(name, exception, message); end

  # Returns the value of attribute exception.
  #
  # source://rails-healthcheck//lib/healthcheck/error.rb#5
  def exception; end

  # Sets the attribute exception
  #
  # @param value the value to set the attribute exception to.
  #
  # source://rails-healthcheck//lib/healthcheck/error.rb#5
  def exception=(_arg0); end

  # Returns the value of attribute message.
  #
  # source://rails-healthcheck//lib/healthcheck/error.rb#5
  def message; end

  # Sets the attribute message
  #
  # @param value the value to set the attribute message to.
  #
  # source://rails-healthcheck//lib/healthcheck/error.rb#5
  def message=(_arg0); end

  # Returns the value of attribute name.
  #
  # source://rails-healthcheck//lib/healthcheck/error.rb#5
  def name; end

  # Sets the attribute name
  #
  # @param value the value to set the attribute name to.
  #
  # source://rails-healthcheck//lib/healthcheck/error.rb#5
  def name=(_arg0); end
end

class Healthcheck::HealthchecksController < ::ActionController::Base
  def check; end

  private

  # source://actionview/8.0.1/lib/action_view/layouts.rb#328
  def _layout(lookup_context, formats); end

  class << self
    # source://actionpack/8.0.1/lib/action_dispatch/routing/route_set.rb#612
    def _routes; end

    private

    # source://activesupport/8.0.1/lib/active_support/class_attribute.rb#15
    def __class_attr__wrapper_options; end

    # source://activesupport/8.0.1/lib/active_support/class_attribute.rb#17
    def __class_attr__wrapper_options=(new_value); end

    # source://activesupport/8.0.1/lib/active_support/class_attribute.rb#15
    def __class_attr_helpers_path; end

    # source://activesupport/8.0.1/lib/active_support/class_attribute.rb#17
    def __class_attr_helpers_path=(new_value); end

    # source://activesupport/8.0.1/lib/active_support/class_attribute.rb#15
    def __class_attr_middleware_stack; end

    # source://activesupport/8.0.1/lib/active_support/class_attribute.rb#17
    def __class_attr_middleware_stack=(new_value); end
  end
end

module Healthcheck::HealthchecksController::HelperMethods
  include ::ActionText::ContentHelper
  include ::ActionText::TagHelper
  include ::InertiaRails::Helper
  include ::InertiaRails::AssetHelper
  include ::ViteRails::TagHelpers
  include ::ActionController::Base::HelperMethods
  include ::CsrfHelper
end

# source://rails-healthcheck//lib/healthcheck/response/base.rb#4
module Healthcheck::Response; end

# source://rails-healthcheck//lib/healthcheck/response/base.rb#5
class Healthcheck::Response::Base
  # @return [Base] a new instance of Base
  #
  # source://rails-healthcheck//lib/healthcheck/response/base.rb#6
  def initialize(controller, checker); end

  # source://rails-healthcheck//lib/healthcheck/response/base.rb#12
  def execute!; end

  private

  # @return [Boolean]
  #
  # source://rails-healthcheck//lib/healthcheck/response/base.rb#18
  def verbose?; end
end

# source://rails-healthcheck//lib/healthcheck/response/error.rb#5
class Healthcheck::Response::Error < ::Healthcheck::Response::Base
  # source://rails-healthcheck//lib/healthcheck/response/error.rb#16
  def status; end

  # source://rails-healthcheck//lib/healthcheck/response/error.rb#6
  def verbose; end
end

# source://rails-healthcheck//lib/healthcheck/response/success.rb#5
class Healthcheck::Response::Success < ::Healthcheck::Response::Base
  # source://rails-healthcheck//lib/healthcheck/response/success.rb#16
  def status; end

  # source://rails-healthcheck//lib/healthcheck/response/success.rb#6
  def verbose; end
end

# source://rails-healthcheck//lib/healthcheck/router.rb#4
class Healthcheck::Router
  class << self
    # source://rails-healthcheck//lib/healthcheck/router.rb#5
    def mount(router); end
  end
end

# source://rails-healthcheck//lib/healthcheck/version.rb#4
Healthcheck::VERSION = T.let(T.unsafe(nil), String)
