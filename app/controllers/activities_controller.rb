# typed: true
# frozen_string_literal: true

class ActivitiesController < ApplicationController
  # == Filters
  before_action :authenticate_user!

  # == Actions
  # GET /activities
  def index
    current_user = authenticate_user!
    used_template_ids = current_user.activities.distinct.pluck(:template_id)
    available_templates = ActivityTemplate.where.not(id: used_template_ids)
    render(json: {
      activities: ActivitySerializer.many(current_user.activities),
      "activityTemplates" =>
        ActivityTemplateSerializer.many(available_templates),
    })
  end

  # POST /activities
  def create
    current_user = authenticate_user!
    activity_params = params.expect(activity: %i[
      template_id
      name
      emoji
      description
      location_name
    ])
    activity = current_user.activities.build(**activity_params)
    if activity.save
      render(json: {
        activity: ActivitySerializer.one(activity),
      })
    else
      render(
        json: {
          errors: activity.form_errors,
        },
        status: :unprocessable_entity,
      )
    end
  end
end
