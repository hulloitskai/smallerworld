# typed: strict
# frozen_string_literal: true

class TestMailer < ApplicationMailer
  sig { params(model: TestModel).returns(Mail::Message) }
  def test_email(model)
    mail(
      to: Contact.email,
      subject: "It's Kai!",
      inertia: "TestEmail",
      props: {
        model: model.to_h,
      },
    )
  end
end
