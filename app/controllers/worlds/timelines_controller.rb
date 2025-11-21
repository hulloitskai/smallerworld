# typed: true
# frozen_string_literal: true

module Worlds
  class TimelinesController < ApplicationController
    # == Actions ==

    # GET /world/:id/timeline?start_date=...&time_zone=...[&friend_token=...]
    def show
      respond_to do |format|
        format.json do
          world = find_world!
          time_zone = parse_time_zone_param(params[:time_zone])
          start_date = parse_start_date_param(params[:start_date], time_zone:)
          timeline_posts = scoped do
            scope = authorized_scope(world.posts)
              .where(created_at: start_date.in_time_zone(time_zone)..)
            scoped do
              tz = time_zone.name
              select_sql = Post.sanitize_sql_array([
                "DISTINCT ON (DATE(created_at AT TIME ZONE :tz)) " \
                  "DATE(created_at AT TIME ZONE :tz) AS date, emoji",
                tz:,
              ])
              order_sql = Post.sanitize_sql_array([
                "DATE(created_at AT TIME ZONE :tz), created_at DESC",
                tz:,
              ])
              scope
                .select(select_sql)
                .order(Arel.sql(order_sql))
                .to_a
            end
          end
          timeline = timeline_posts.map do |post|
            date = T.cast(post["date"], Date)
            [date.to_s, { emoji: post["emoji"] }]
          end.to_h
          post_streak = if allowed_to?(:manage?, world)
            world.post_streak(time_zone:)
          end
          render(json: {
            timeline:,
            "postStreak" => PostStreakSerializer.one_if(post_streak),
          })
        end
      end
    end

    private

    # == Helpers ==

    sig { params(value: T.untyped).returns(ActiveSupport::TimeZone) }
    def parse_time_zone_param(value)
      raise "Missing time zone" unless value

      if value.is_a?(String)
        ActiveSupport::TimeZone.new(value)
      else
        raise "Invalid time zone: #{value}"
      end
    end

    sig do
      params(value: T.untyped, time_zone: ActiveSupport::TimeZone).returns(Date)
    end
    def parse_start_date_param(value, time_zone:)
      raise "Missing start date" unless value

      start_date = if value.is_a?(String)
        value.to_date
      else
        raise "Invalid start date: #{value}"
      end
      if start_date > 1.year.ago.in_time_zone(time_zone).to_date
        start_date
      else
        raise "Start date must be within the last year"
      end
    end
  end
end
