import { type BrowserOptions } from "@sentry/react";
import {
  captureConsoleIntegration,
  contextLinesIntegration,
  httpClientIntegration,
  init,
  replayCanvasIntegration,
  replayIntegration,
} from "@sentry/react";
import { AxiosError } from "axios";

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
      sendDefaultPii: true,
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
      denyUrls: [
        /^https:\/\/edge\.fullstory\.com\//,
        /^https:\/\/cdn\.fullstory\.com\//,
        /^https:\/\/www\.clarity\.ms\/s\//,
      ],
      beforeSend: (event, { originalException }) => {
        if (originalException instanceof AxiosError) {
          if (originalException.message === "Network Error") {
            return null;
          }
        } else if (originalException instanceof TypeError) {
          const { message } = originalException;
          if (
            message === "Load failed" ||
            isFetchFailedMessage(message) ||
            isScriptLoadFailedMessage(message) ||
            isModuleImportFailedMessage(message)
          ) {
            return null;
          }
        } else if (originalException instanceof Error) {
          if (
            "response" in originalException &&
            originalException.response instanceof Response
          ) {
            const { response } = originalException;
            if (response.status >= 500 && response.status < 600) {
              return null;
            }
          } else {
            if (originalException.name === "AbortError") {
              return null;
            }
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
