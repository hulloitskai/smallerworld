import { /*add,*/ init } from "@amplitude/analytics-browser";
import { type BrowserOptions } from "@amplitude/analytics-core";

// import { sessionReplayPlugin } from "@amplitude/plugin-session-replay-browser";
import { getMeta } from "~/helpers/meta";

import { identifyDevice } from "./fingerprinting";

export const setupAmplitude = () => {
  const apiKey = getMeta("amplitude-api-key");
  if (apiKey) {
    void identifyDevice().then(({ visitorId }) => {
      const options: BrowserOptions = {
        deviceId: visitorId,
        autocapture: true,
      };

      // // Configure session replay
      // const sessionReplayTracking = sessionReplayPlugin({
      //   deviceId: visitorId,
      //   forceSessionTracking: true,
      //   sampleRate: 0.5,
      //   performanceConfig: {
      //     enabled: true,
      //   },
      // });
      // add(sessionReplayTracking);

      // Initialize Amplitude
      init(apiKey, options);
      console.info("Initialized Amplitude", options);
    });
  } else {
    console.warn("Missing Amplitude API key; skipping initialization");
  }
};
