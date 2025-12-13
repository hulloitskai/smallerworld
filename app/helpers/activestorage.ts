import { start } from "@rails/activestorage";

export const setupActiveStorage = (): void => {
  start();
};
