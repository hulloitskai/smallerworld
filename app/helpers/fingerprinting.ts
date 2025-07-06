import {
  type Agent as FingerprintJsAgent,
  type GetResult,
  load as loadFingerprintJs,
} from "@fingerprintjs/fingerprintjs";

export interface FingerprintingResult {
  fingerprint: string;
  confidenceScore: number;
}

let fingerprintJsAgent: Promise<FingerprintJsAgent> | null = null;

export const preloadFingerprintJs = (): void => {
  fingerprintJsAgent = loadFingerprintJs();
};

export const fingerprintJs = (): Promise<GetResult> => {
  if (!fingerprintJsAgent) {
    fingerprintJsAgent = loadFingerprintJs();
  }
  return fingerprintJsAgent.then(agent => agent.get());
};

export const fingerprintDevice = async (): Promise<FingerprintingResult> => {
  return fingerprintJs().then(({ visitorId, confidence }) => ({
    fingerprint: visitorId,
    confidenceScore: confidence.score,
  }));
  // const apiKey = requireMeta("overpowered-api-key");
  // const endpoint = requireMeta("overpowered-endpoint");
  // return window.opjs({ API_KEY: apiKey, ENDPOINT: endpoint }).then(response => {
  //   if ("error" in response) {
  //     const { error } = response;
  //     console.error("Failed to fingerprint device using Overpowered", {
  //       error,
  //     });
  //     console.info("Falling back to FingerprintJS");
  //   }
  //   const { clusterUUID, uniquenessScore, botScore } = response;
  //   return {
  //     fingerprint: clusterUUID,
  //     confidenceScore: Number.isFinite(uniquenessScore)
  //       ? uniquenessScore / 5
  //       : (6 - botScore) / 5,
  //   };
  // });
};

export const useDeviceFingerprint = ():
  | FingerprintingResult
  | null
  | undefined => {
  const [fingerprint, setFingerprint] = useState<
    FingerprintingResult | null | undefined
  >(null);
  useEffect(() => {
    void fingerprintDevice().then(setFingerprint);
  }, []);
  return fingerprint;
};
