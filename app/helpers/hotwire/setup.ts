import "@hotwired/turbo-rails";

import { Application } from "@hotwired/stimulus";
import {
  AlertBridgeController,
  ButtonBridgeController,
  // @ts-expect-error - No TS types for @joemasilotti/bridge-components
} from "@joemasilotti/bridge-components";

export const setupHotwire = (): void => {
  // @ts-expect-error - Bad TS types
  Turbo.session.drive = false;

  const application = Application.start();
  /* eslint-disable @typescript-eslint/no-unsafe-argument */
  application.register("button-bridge", ButtonBridgeController);
  application.register("alert-bridge", AlertBridgeController);
  /* eslint-enable @typescript-eslint/no-unsafe-argument */
};
