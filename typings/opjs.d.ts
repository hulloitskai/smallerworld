import { type opjs } from "overpoweredjs";

type ResponseData = Awaited<ReturnType<typeof opjs>> | { error: string };

declare global {
  interface Window {
    opjs: (options: {
      API_KEY: string;
      ENDPOINT?: string;
    }) => Promise<ResponseData>;
  }
}
