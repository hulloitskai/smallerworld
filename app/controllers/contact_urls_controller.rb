# typed: true
# frozen_string_literal: true

class ContactUrlsController < ApplicationController
  # == Actions ==

  # GET /contact_url?subject=...&body=...
  def show
    respond_to do |format|
      format.json do
        contact_url_params = ContactUrlParameters.new(params)
        contact_url_params.validate!
        mailto_uri = Contact.mailto_uri
        mailto_uri.query_values = contact_url_params.mailto_params
        sms_uri = Contact.sms_uri
        sms_uri.query_values = contact_url_params.sms_params
        render(json: {
          mailto: mailto_uri.to_s,
          sms: sms_uri.to_s,
        })
      end
    end
  end
end
