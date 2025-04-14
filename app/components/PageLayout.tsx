import { ModalsProvider } from "@mantine/modals";

import AppFlash from "./AppFlash";
import ClarityTracking from "./ClarityTracking";
import FullStoryTracking from "./FullStoryTracking";
import MiniProfilerPageTracking from "./MiniProfilerPageTracking";
import PageMeta from "./PageMeta";
import SentryTracking from "./SentryTracking";
import StandaloneSessionProvider from "./StandaloneSessionProvider";
import WebPushProvider from "./WebPushProvider";

import "@fontsource-variable/manrope";
import "@fontsource-variable/bricolage-grotesque";

import "@mantine/core/styles.layer.css";

const PageLayout: FC<PropsWithChildren> = ({ children }) => (
  <StandaloneSessionProvider>
    <WebPushProvider>
      <ModalsProvider modalProps={{ size: "md" }}>{children}</ModalsProvider>
    </WebPushProvider>
    <PageMeta />
    <AppFlash />
    <SentryTracking />
    <FullStoryTracking />
    <ClarityTracking />
    <MiniProfilerPageTracking />
  </StandaloneSessionProvider>
);

export default PageLayout;
