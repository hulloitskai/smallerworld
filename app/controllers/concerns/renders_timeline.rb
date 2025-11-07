# typed: true
# frozen_string_literal: true

module RendersTimeline
  extend T::Sig
  extend T::Helpers

  requires_ancestor { ActionController::Base }

  private

  # == Helpers

  sig { returns(ActiveSupport::TimeZone) }
  def find_timeline_time_zone!
    zone_name = params[:time_zone] or raise "Missing time zone"
    if zone_name.is_a?(String)
      ActiveSupport::TimeZone.new(zone_name)
    else
      raise "Invalid time zone: #{zone_name}"
    end
  end

  sig do
    params(time_zone: ActiveSupport::TimeZone).returns(Date)
  end
  def find_timeline_start_date!(time_zone:)
    date_param = params[:start_date] or raise "Missing start date"
    start_date = if date_param.is_a?(String)
      date_param.to_date
    else
      raise "Invalid start date: #{date_param}"
    end
    if start_date > 1.year.ago.in_time_zone(time_zone).to_date
      start_date
    else
      raise "Start date must be within the last year"
    end
  end

  sig do
    params(posts_with_date: T::Array[Post]).returns(T::Hash[
      String,
      { emoji: T.nilable(String) },
    ])
  end
  def build_timeline(posts_with_date)
    posts_with_date.map do |post|
      date = T.cast(post["date"], Date)
      [date.to_s, { emoji: post.emoji }]
    end.to_h
  end
end
