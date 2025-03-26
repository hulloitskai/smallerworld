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

export const setupSentry = () => {
  const dsn = getMeta("sentry-dsn");
  const tracesSampleRate = getFloatMeta("sentry-traces-sample-rate");
  const profilesSampleRate = getFloatMeta("sentry-profiles-sample-rate");
  if (dsn) {
    const options: BrowserOptions = {
      dsn,
      environment: import.meta.env.RAILS_ENV,
      tracesSampleRate,
      profilesSampleRate,
      // enabled: import.meta.env.RAILS_ENV === "production",
      sendDefaultPii: true,
      integrations: [
        contextLinesIntegration(),
        captureConsoleIntegration({ levels: ["error", "assert"] }),
        replayIntegration(),
        replayCanvasIntegration(),
        httpClientIntegration(),
      ],
      ignoreErrors: [
        "ResizeObserver loop completed with undelivered notifications.",
        /^Error loading edge\.fullstory\.com/,
      ],
      beforeSend(event) {
        if (event.exception?.values) {
          const isFailedToFetch = event.exception.values.some(
            ({ type, value }) => {
              if (type !== "TypeError" || !value) {
                return false;
              }
              return ["Failed to fetch", "Load failed"].includes(value);
            },
          );
          if (isFailedToFetch) {
            return null;
          }
        }
        return event;
      },
    };
    init(options);
    const info = omitBy(omit(options, "ignoreErrors", "integrations"), isNil);
    console.info("initialized Sentry", info);
  } else {
    console.warn("missing Sentry DSN; skipping initialization");
  }
};

const getFloatMeta = (name: string) => {
  const value = getMeta(name);
  return value ? parseFloat(value) : undefined;
};
