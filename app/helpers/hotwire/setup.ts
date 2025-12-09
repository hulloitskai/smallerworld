import "@hotwired/turbo";

import { Application } from "@hotwired/stimulus";
// @ts-expect-error - No TS types for @joemasilotti/bridge-components
import { ButtonBridgeController } from "@joemasilotti/bridge-components";

export const setupHotwire = (): void => {
  // @ts-expect-error - Bad TS types
  Turbo.session.drive = false;

  const application = Application.start();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  application.register("bridge--button", ButtonBridgeController);
};
