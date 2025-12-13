// Import and register all your controllers from the importmap via controllers/**/*_controller
import TextareaAutogrowController from "stimulus-textarea-autogrow";
import { registerControllers } from "stimulus-vite-helpers";

import { application } from "./application";

application.register("textarea-autogrow", TextareaAutogrowController);

const controllers = import.meta.glob("./**/*_controller.js", { eager: true });
registerControllers(application, controllers);
