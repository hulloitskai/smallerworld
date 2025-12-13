/** @returns {"production" | "development" | "test"} */
export const getEnv = () => {
  const el = document.querySelector("meta[name='env']");
  if (!el) {
    throw new Error("Missing <meta name='env'> in document head");
  }
  return el.getAttribute("content");
};

export const isDevelopment = () => getEnv() === "development";
export const isProduction = () => getEnv() === "production";
