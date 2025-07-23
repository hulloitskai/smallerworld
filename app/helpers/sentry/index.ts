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

import { initServiceWorkerSentry } from "../serviceWorker/client";
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
      enabled: environment === "production",
    };

    // == Browser client initialization
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

    // == Service worker client initialization
    if ("serviceWorker" in navigator) {
      const { serviceWorker } = navigator;
      void serviceWorker.ready.then(({ active }) => {
        if (active) {
          void initServiceWorkerSentry(active, config);
        }
      });
      serviceWorker.addEventListener("controllerchange", () => {
        const { controller } = serviceWorker;
        if (controller) {
          void initServiceWorkerSentry(controller, config);
        }
      });
    }
  } else {
    console.warn("Missing Sentry DSN; skipping initialization");
  }
};

const getFloatMeta = (name: string) => {
  const value = getMeta(name);
  return value ? parseFloat(value) : undefined;
};
