export const getMeta = (name: string): string | undefined => {
  if (typeof document === "undefined") {
    return;
  }
  const el = document.head.querySelector(`meta[name="${name}"][content]`);
  if (el) {
    const content = el.getAttribute("content");
    return content ?? undefined;
  }
};

export const setMeta = (name: string, content: string): void => {
  if (typeof document === "undefined") {
    return;
  }
  const el = document.head.querySelector(`meta[name="${name}"][content]`);
  if (el) {
    el.setAttribute("content", content);
  }
};

export const requireMeta = (name: string): string => {
  const content = getMeta(name);
  if (!content) {
    throw new Error(`Missing meta content for '${name}'`);
  }
  return content;
};
