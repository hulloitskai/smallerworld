import { Application } from "@hotwired/stimulus";

import { isDevelopment } from "~/javascript/helpers/env";

const application = Application.start();

// Configure Stimulus development experience
application.debug = isDevelopment();
window.Stimulus = application;

export { application };
