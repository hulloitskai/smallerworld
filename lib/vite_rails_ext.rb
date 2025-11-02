# typed: true
# frozen_string_literal: true

require "vite_ruby_ext"
require "vite_rails"

class ViteRails::Engine
  initializer "vite_rails.ssr_support" do
    ActiveSupport.on_load(:action_controller) do
      T.bind(self, T.class_of(ActionController::Base))

      around_action do |controller, action|
        if controller.params[:ssr].truthy?
          ViteRuby.without_dev_server(&action)
        else
          action.call
        end
      end
    end
  end
end if defined?(ViteRails::Engine)
