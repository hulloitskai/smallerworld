import { type ErrorEvent, type EventHint } from "@sentry/browser";
import { AxiosError } from "axios";

export const DENY_URLS = [
  /^https:\/\/edge\.fullstory\.com\//,
  /^https:\/\/cdn\.fullstory\.com\//,
  /^https:\/\/www\.clarity\.ms\/s\//,
];

export const beforeSend = (
  event: ErrorEvent,
  { originalException }: EventHint,
) => {
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
};

const isModuleImportFailedMessage = (message: string) =>
  message === "Importing a module script failed.";

const isFetchFailedMessage = (message: string) =>
  message.startsWith("Failed to fetch");

const isScriptLoadFailedMessage = (message: string) =>
  message.startsWith("Script") && message.endsWith("load failed");
