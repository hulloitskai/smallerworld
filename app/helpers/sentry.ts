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
        "HTTP Client Error with status code: 503",
        "Authentication required",
        "Shutdown called.",
        /^Error loading edge\.fullstory\.com/,
      ],
      beforeSend(event) {
        if (event.exception?.values) {
          const shouldSend = event.exception.values.every(({ type, value }) => {
            if (!value) {
              return false;
            }
            if (
              type === "TypeError" &&
              (value == "Load failed" ||
                isFetchFailedMessage(value) ||
                isScriptLoadFailedMessage(value) ||
                isModuleImportFailedMessage(value))
            ) {
              return false;
            }
            return true;
          });
          if (!shouldSend) {
            return null;
          }
        }
        return event;
      },
    };
    init(options);
    const info = omitBy(omit(options, "ignoreErrors", "integrations"), isNil);
    console.info("Initialized Sentry", info);
  } else {
    console.warn("Missing Sentry DSN; skipping initialization");
  }
};

const getFloatMeta = (name: string) => {
  const value = getMeta(name);
  return value ? parseFloat(value) : undefined;
};

const isModuleImportFailedMessage = (message: string) =>
  message === "Importing a module script failed.";

const isFetchFailedMessage = (message: string) =>
  message.startsWith("Failed to fetch");

const isScriptLoadFailedMessage = (message: string) =>
  message.startsWith("Script") && message.endsWith("load failed");
