import { type BrowserOptions } from "@sentry/browser";

export const SERVICE_WORKER_URL = "/sw.js";
export const SERVICE_WORKER_UPDATE_INTERVAL = 60 * 60 * 1000; // 1 hour

export interface ServiceWorkerMetadata {
  deviceId: string;
  serviceWorkerVersion: number;
}

export type ServiceWorkerCommandMessage =
  | {
      command: "shutdown";
    }
  | {
      command: "skipWaiting";
    }
  | {
      command: "getMetadata";
    }
  | {
      command: "initSentry";
      options: BrowserOptions;
    };
