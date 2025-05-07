import { type BrowserOptions } from "@sentry/react";
import {
  captureConsoleIntegration,
  contextLinesIntegration,
  httpClientIntegration,
  init,
  replayCanvasIntegration,
  replayIntegration,
} from "@sentry/react";

import { getMeta } from "~/helpers/meta";

import { beforeSend, DENY_URLS } from "./filtering";

export const setupSentry = () => {
  const dsn = getMeta("sentry-dsn");
  const tracesSampleRate = getFloatMeta("sentry-traces-sample-rate");
  const profilesSampleRate = getFloatMeta("sentry-profiles-sample-rate");
  if (dsn) {
    const environment = import.meta.env.RAILS_ENV;
    const config: BrowserOptions = {
      dsn,
      environment,
      tracesSampleRate,
      profilesSampleRate,
      sendDefaultPii: true,
    };
    init({
      ...config,
      integrations: [
        contextLinesIntegration(),
        captureConsoleIntegration({ levels: ["error", "assert"] }),
        replayIntegration(),
        replayCanvasIntegration(),
        httpClientIntegration(),
      ],
      ignoreErrors: [
        /^Error loading edge\.fullstory\.com\/s\/fs/,
        /^ResizeObserver loop completed with undelivered notifications\.$/,
        /^Authentication required$/,
      ],
      denyUrls: DENY_URLS,
      beforeSend,
    });
    console.info("Initialized Sentry", config);

    const setupSentryOnServiceWorker = (sw: ServiceWorker): void => {
      const { port1, port2 } = new MessageChannel();
      port1.onmessage = ({ data }) => {
        invariant(typeof data === "object", "Invalid message data");
        const { config, error } = data;
        if (config) {
          console.info("Initialized Sentry on service worker", config);
        } else if (typeof error === "string") {
          console.error("Failed to initialize Sentry on service worker", error);
        }
      };
      console.info("Initializing Sentry on service worker...");
      sw.postMessage(
        {
          action: "initSentry",
          dsn,
          environment,
          tracesSampleRate,
          profilesSampleRate,
        },
        [port2],
      );
    };
    void navigator.serviceWorker.ready.then(registration => {
      // Handle the current active service worker
      if (registration.active) {
        setupSentryOnServiceWorker(registration.active);
      }

      // Handle future service worker updates
      registration.addEventListener("updatefound", () => {
        // Get the installing service worker
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            // Set up Sentry when it becomes active
            if (newWorker.state === "activated") {
              setupSentryOnServiceWorker(newWorker);
            }
          });
        }
      });
    });
  } else {
    console.warn("Missing Sentry DSN; skipping initialization");
  }
};

const getFloatMeta = (name: string) => {
  const value = getMeta(name);
  return value ? parseFloat(value) : undefined;
};
