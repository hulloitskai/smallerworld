# typed: true
# frozen_string_literal: true

class TestController < ApplicationController
  # == Actions ==

  # GET /test
  def show
    respond_to do |format|
      format.html do
        name = "Big Joe"
        render(inertia: "TestPage", props: { name: })
      end
    end
  end

  # POST /test/submit
  def submit
    respond_to do |format|
      format.json do
        model_params = params.expect(model: %i[name birthday])
        model = TestModel.new(model_params)
        if model.valid?
          render(json: { model: })
        else
          render(
            json: { errors: model.form_errors },
            status: :unprocessable_content,
          )
        end
      end
    end
  end
end
