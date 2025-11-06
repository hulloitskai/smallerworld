# typed: true
# frozen_string_literal: true

module BuildsTimeline
  extend T::Sig
  extend T::Helpers

  private

  sig do
    params(
      posts_with_date: T::Array[Post],
      time_zone: ActiveSupport::TimeZone,
    ).returns(T::Hash[
        String,
        { emoji: T.nilable(String), streak: T::Boolean },
      ])
  end
  def build_timeline(posts_with_date, time_zone:)
    timeline = posts_with_date.map do |post|
      date = T.cast(post["date"], Date)
      [date.to_s, { emoji: post.emoji, streak: T.let(false, T::Boolean) }]
    end.to_h
    today = time_zone.today
    today_or_yesterday = (today - 1)..today
    posts_with_date.reverse_each do |post|
      date = T.cast(post["date"], Date)
      if date.in?(today_or_yesterday) || timeline.dig((date + 1).to_s, :streak)
        timeline.fetch(date.to_s)[:streak] = true
      end
    end
    timeline
  end
end
