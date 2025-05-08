import { init } from "@amplitude/analytics-browser";
import { type BrowserOptions } from "@amplitude/analytics-core";

import { getMeta } from "~/helpers/meta";

import { identifyVisitor } from "./fingerprinting";

export const setupAmplitude = () => {
  const apiKey = getMeta("amplitude-api-key");
  if (apiKey) {
    void identifyVisitor().then(({ visitorId }) => {
      const options: BrowserOptions = {
        deviceId: visitorId,
        autocapture: true,
      };
      init(apiKey, options);
      console.info("Initialized Amplitude", options);
    });
  } else {
    console.warn("Missing Amplitude API key; skipping initialization");
  }
};
