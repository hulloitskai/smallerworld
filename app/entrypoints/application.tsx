import "requestidlecallback-polyfill";

import { createInertiaApp } from "@inertiajs/react";
import { reactErrorHandler } from "@sentry/react";
import { createRoot, hydrateRoot } from "react-dom/client";

import AppWrapper from "~/components/AppWrapper";
import { preparePage } from "~/components/inertia/client";
import { setupActiveStorage } from "~/helpers/activestorage";
import { setupAmplitude } from "~/helpers/amplitude";
import { setupClarity } from "~/helpers/clarity";
import { setupDayjs } from "~/helpers/dayjs";
import { setupDevtools } from "~/helpers/devtools";
import { setupFullStory } from "~/helpers/fullstory";
import { setupTurbo } from "~/helpers/hotwire";
import { parsePageImports } from "~/helpers/inertia";
import { setupInertia } from "~/helpers/inertia/setup";
import { setupLuxon } from "~/helpers/luxon";
import { isStandaloneDisplayMode } from "~/helpers/pwa";
import { setupReactGrab } from "~/helpers/react-grab";
import { setupRoutes } from "~/helpers/routes";
import { setupSentry } from "~/helpers/sentry";
import {
  handlePrecaching,
  handleServiceWorkerMessages,
  registerServiceWorker,
  unregisterOutdatedServiceWorkers,
} from "~/helpers/serviceWorker/client";

import "./application.css";

// == Setup
window.BOOTED_AT = new Date();

setupTurbo();
setupInertia();
setupRoutes();
setupLuxon();
setupDayjs();
setupActiveStorage();
requestIdleCallback(() => {
  setupDevtools();
  setupSentry();
  setupFullStory();
  setupAmplitude();
  setupClarity();
  setupReactGrab();
});

// == Service worker
if ("serviceWorker" in navigator && isStandaloneDisplayMode()) {
  handleServiceWorkerMessages();
  handlePrecaching();
  void unregisterOutdatedServiceWorkers();
  void registerServiceWorker();
}

// == Pages
const pageImports = import.meta.glob("~/pages/*.tsx", {
  import: "default",
}) as Record<string, () => Promise<PageComponent>>;
const pages = parsePageImports(pageImports);

document.addEventListener("DOMContentLoaded", () => {
  void createInertiaApp({
    progress: false,
    resolve: async name => {
      const importPage = pages[name];
      if (!importPage) {
        throw new Error(`Missing page '${name}'`);
      }
      const component = await importPage();
      if (!component) {
        throw new Error(`Missing default export for page '${name}'`);
      }
      preparePage(component);
      return component;
    },
    setup: ({ App, el, props }) => {
      const { initialPage } = props;
      const app = (
        <AppWrapper {...{ initialPage }}>
          <App {...props} />
        </AppWrapper>
      );
      if (el.hasChildNodes()) {
        hydrateRoot(el, app, {
          onRecoverableError: reactErrorHandler(),
        });
      } else {
        createRoot(el, {
          onRecoverableError: reactErrorHandler(),
        }).render(app);
      }
    },
    defaults: {
      visitOptions: (href, { headers }) => {
        const csrfToken = getMeta("csrf-token");
        return {
          viewTransition: true,
          headers: {
            ...headers,
            ...(csrfToken && {
              "X-CSRF-Token": csrfToken,
            }),
          },
        };
      },
    },
  });
});
