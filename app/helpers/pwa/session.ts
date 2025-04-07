import { createContext, useContext } from "react";

export interface StandaloneSession {
  csrf: {
    param: string;
    token: string;
  };
}

export const StandaloneSessionContext = createContext<
  StandaloneSession | undefined | null | 0
>(0);

export const useStandaloneSession = ():
  | StandaloneSession
  | null
  | undefined => {
  const session = useContext(StandaloneSessionContext);
  if (session === 0) {
    throw new Error(
      "useStandaloneSession must be used within a StandaloneSessionProvider",
    );
  }
  return session;
};
