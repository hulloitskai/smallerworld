# typed: true
# frozen_string_literal: true

module Users::Worlds
  class ActivitiesController < ApplicationController
    # == Actions ==

    # GET /world/activities
    def index
      respond_to do |format|
        format.json do
          world = current_world!
          activities = authorized_scope(world.activities)
          used_template_ids = activities.distinct.pluck(:template_id)
          available_templates = ActivityTemplate
            .where.not(id: used_template_ids)
          render(json: {
            activities: ActivitySerializer.many(activities),
            "activityTemplates" =>
              ActivityTemplateSerializer.many(available_templates)
          })
        end
      end
    end

    # POST /world/activities
    def create
      respond_to do |format|
        format.json do
          world = current_world!
          authorize!(world)
          activity_params = params.expect(activity: %i[
            template_id
            name
            emoji
            description
            location_name
          ])
          activity = world.activities.build(**activity_params)
          if activity.save
            render(json: {
              activity: ActivitySerializer.one(activity)
            })
          else
            render(
              json: {
                errors: activity.form_errors
              },
              status: :unprocessable_content,
            )
          end
        end
      end
    end
  end
end
