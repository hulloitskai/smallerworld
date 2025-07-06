export const SERVICE_WORKER_METADATA_ENDPOINT = "/sw";
export const SERVICE_WORKER_URL = "/sw.js";
export const SERVICE_WORKER_UPDATE_INTERVAL = 60 * 60 * 1000; // 1 hour

export interface ServiceWorkerMetadata {
  device_id: string;
  service_worker_version: number;
}
