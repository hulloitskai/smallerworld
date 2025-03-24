export const possessive = (name: string): string =>
  name.endsWith("s") ? `${name}'` : `${name}'s`;
