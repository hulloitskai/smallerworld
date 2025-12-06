export const setupReactGrab = (): void => {
  if (import.meta.env.DEV) {
    void import("react-grab");
  }
};
