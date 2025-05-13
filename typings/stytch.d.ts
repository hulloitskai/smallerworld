declare global {
  interface Window {
    GetTelemetryID(options: { publicToken: string }): Promise<string>;
  }
}

export {};
