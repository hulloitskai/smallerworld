import { type Agent, type GetResult, load } from "@fingerprintjs/fingerprintjs";

let fingerprintPromise: Promise<Agent> | null = null;

export const setupFingerprint = (): void => {
  fingerprintPromise = load();
};

export const identifyVisitor = async (): Promise<GetResult> => {
  if (!fingerprintPromise) {
    fingerprintPromise = load();
  }
  return fingerprintPromise.then(agent => agent.get());
};
