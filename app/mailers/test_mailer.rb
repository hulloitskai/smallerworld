# typed: strict
# frozen_string_literal: true

class TestMailer < ApplicationMailer
  sig { params(model: TestModel).returns(Mail::Message) }
  def test_email(model)
    mail(
      to: Contact.email_address,
      subject: "this is a test email",
      inertia: "TestEmail",
      props: {
        model: model.to_h,
      },
    )
  end
end
