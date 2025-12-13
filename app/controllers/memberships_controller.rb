# typed: true
# frozen_string_literal: true

class MembershipsController < ApplicationController
  # == Actions ==

  # POST /membership/activate
  def activate
    respond_to do |format|
      format.json do
        current_user = authenticate_user!
        begin
          pending_guests = ZeffyService.list_pending_guests
        rescue => error
          raise "Zeffy error: #{error.message}"
        end
        matching_guest = find_matching_guest(pending_guests)
        if matching_guest
          begin
            ZeffyService.check_in_guest(matching_guest.fetch("id"))
          rescue => error
            raise "Zeffy error: #{error.message}"
          end
          membership_tier = membership_tier_from_guest_rate(matching_guest)
          current_user.update!(membership_tier:)
        end
        render(json: {
          "membershipTier" => current_user.membership_tier
        })
      end
    end
  end

  private

  # == Helpers ==

  sig do
    params(pending_guests: T::Array[T::Hash[String, T.untyped]])
      .returns(T.nilable(T::Hash[String, T.untyped]))
  end
  def find_matching_guest(pending_guests)
    current_user = authenticate_user!
    world = current_user.world
    pending_guests.find do |guest|
      question_responses = guest.fetch("questionsAndNotes").presence or next
      phone_number_or_handle = question_responses.first!.strip.downcase
      phone_number_or_handle == world&.handle ||
        normalized_phone_number(phone_number_or_handle) ==
          current_user.phone_number
    end
  end

  sig { params(phone_number: String).returns(String) }
  def normalized_phone_number(phone_number)
    phone = Phonelib.parse(phone_number)
    phone.to_s
  end

  sig { params(guest: T::Hash[String, T.untyped]).returns(Symbol) }
  def membership_tier_from_guest_rate(guest)
    rate_name = guest.fetch("rateName").downcase
    if rate_name.include?("believer")
      :believer
    elsif rate_name.include?("supporter")
      :supporter
    else
      raise "Unknown guest rate: #{rate_name}"
    end
  end
end
