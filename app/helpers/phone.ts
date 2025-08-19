import parsePhone from "phone";

export interface PhoneParts {
  country_code: string;
  national_phone_number: string;
}

export const parsePhoneFromParts = ({
  country_code,
  national_phone_number,
}: PhoneParts): string | null => {
  const number = [country_code, national_phone_number].join(" ");
  const phone = parsePhone(number);
  return phone.isValid ? phone.phoneNumber : null;
};

export const mustParsePhoneFromParts = (
  phonePartsValues: PhoneParts,
): string => {
  const phoneNumber = parsePhoneFromParts(phonePartsValues);
  if (!phoneNumber) {
    throw new Error("Invalid phone number");
  }
  return phoneNumber;
};
