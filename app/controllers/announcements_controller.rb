# typed: true
# frozen_string_literal: true

class AnnouncementsController < ApplicationController
  include AdminsOnly

  # == Actions ==

  # GET /announcements
  def index
    respond_to do |format|
      format.html do
        render(inertia: "AnnouncementsPage")
      end
      format.json do
        recent_announcements = Announcement.reverse_chronological.limit(10)
        render(json: {
          "recentAnnouncements" =>
            AnnouncementSerializer.many(recent_announcements)
        })
      end
    end
  end

  # POST /announcements
  def create
    respond_to do |format|
      format.json do
        announcement_params = params.expect(announcement: %i[
          message
          test_recipient_phone_number
        ])
        announcement = Announcement.create!(announcement_params)
        render(json: {
          announcement: AnnouncementSerializer.one(announcement)
        })
      end
    end
  end
end
