export const sentencify = (
  message: string,
  lowFirstLetter?: boolean,
): string => {
  if (!message) {
    return "";
  }
  if (lowFirstLetter) {
    message = lowercaseFirstLetter(message);
  }
  if (message.endsWith(".")) {
    return message;
  }
  return `${message}.`;
};

export const lowercaseFirstLetter = (message: string): string =>
  message.charAt(0).toLowerCase() + message.slice(1);
