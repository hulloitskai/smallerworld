import { init, setDeviceId } from "@amplitude/analytics-browser";
import { type BrowserOptions } from "@amplitude/analytics-core";

// import { sessionReplayPlugin } from "@amplitude/plugin-session-replay-browser";
import { getMeta } from "~/helpers/meta";

import { fingerprintDevice } from "./fingerprinting";

export const setupAmplitude = (): void => {
  const apiKey = getMeta("amplitude-api-key");
  if (apiKey) {
    const options: BrowserOptions = { autocapture: true };

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

    // Identify device later
    setTimeout(() => {
      void fingerprintDevice().then(({ fingerprint }) => {
        console.info(
          "Identified device fingerprint for Amplitude",
          fingerprint,
        );
        setDeviceId(fingerprint);
      });
    }, 10_000);
  } else {
    console.warn("Missing Amplitude API key; skipping initialization");
  }
};
