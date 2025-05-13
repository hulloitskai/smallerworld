import {
  type Agent as FingerprintJsAgent,
  load as loadFingerprintJs,
} from "@fingerprintjs/fingerprintjs";

export interface FingerprintingResult {
  fingerprint: string;
  confidenceScore: number;
}

let fingerprintJsAgent: Promise<FingerprintJsAgent> | null = null;

export const fingerprintDevice = async (): Promise<FingerprintingResult> => {
  const apiKey = requireMeta("overpowered-api-key");
  return window
    .opjs({
      API_KEY: apiKey,
      // ENDPOINT: "https://fp.smallerworld.club/fingerprint",
    })
    .then(
      ({ clusterUUID, uniquenessScore }) => ({
        fingerprint: clusterUUID,
        confidenceScore: uniquenessScore / 5,
      }),
      error => {
        console.error("Failed to fingerprint device using Overpowered", error);
        console.info("Falling back to FingerprintJS");
        if (!fingerprintJsAgent) {
          fingerprintJsAgent = loadFingerprintJs();
        }
        return fingerprintJsAgent
          .then(agent => agent.get())
          .then(({ visitorId, confidence }) => ({
            fingerprint: visitorId,
            confidenceScore: confidence.score,
          }));
      },
    );
};
