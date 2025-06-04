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
  const endpoint = requireMeta("overpowered-endpoint");
  return window.opjs({ API_KEY: apiKey, ENDPOINT: endpoint }).then(response => {
    if ("error" in response) {
      const { error } = response;
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
    }
    const { clusterUUID, uniquenessScore, botScore } = response;
    return {
      fingerprint: clusterUUID,
      confidenceScore: Number.isFinite(uniquenessScore)
        ? uniquenessScore / 5
        : (6 - botScore) / 5,
    };
  });
};
