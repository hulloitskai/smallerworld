export const htmlHasText = (html: string): boolean => {
  if (html === "<p></p>") {
    return false;
  }
  const parser = new DOMParser();
  const {
    body: { textContent },
  } = parser.parseFromString(html, "text/html");
  if (!textContent) {
    return false;
  }
  return textContent.trim().length > 0;
};
