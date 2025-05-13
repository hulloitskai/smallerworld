import { type Agent, type GetResult, load } from "@fingerprintjs/fingerprintjs";

let loadFingerprintAgent: Promise<Agent> | null = null;

export const setupFingerprintAgent = (): void => {
  loadFingerprintAgent = load();
};

export const identifyDevice = async (): Promise<GetResult> => {
  if (!loadFingerprintAgent) {
    loadFingerprintAgent = load();
  }
  const agent = await loadFingerprintAgent;
  return agent.get();
};
