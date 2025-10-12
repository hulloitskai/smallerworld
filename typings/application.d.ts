/// <reference types="vite-plugin-pwa/client" />

declare global {
  interface Window {
    BOOTED_AT?: Date;
  }
}

export {};
