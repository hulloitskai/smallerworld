import { type Agent, type GetResult, load } from "@fingerprintjs/fingerprintjs";

let fingerprintPromise: Promise<Agent> | null = null;

export const setupFingerprint = (): void => {
  fingerprintPromise = load();
};

export const identifyVisitor = async (): Promise<GetResult> => {
  if (!fingerprintPromise) {
    fingerprintPromise = load();
  }
  const agent = await fingerprintPromise;
  const visitor = await agent.get();
  console.info("Identified visitor using fingerprintjs", visitor);
  return visitor;
};
