import { Controller } from "@hotwired/stimulus";
import invariant from "tiny-invariant";

export default class extends Controller {
  static targets = ["busyable"];

  observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      invariant(mutation.target instanceof HTMLElement);
      const isBusy = mutation.target.getAttribute("aria-busy") === "true";
      this.#submitTarget().disabled = isBusy;
    });
  });

  busyableTargetConnected(target) {
    invariant(target instanceof HTMLElement);
    this.observer.observe(target, {
      attributes: true,
      attributeFilter: ["aria-busy"],
    });
  }

  busyableTargetDisconnected(target) {
    invariant(target instanceof HTMLElement);
    this.observer.disconnect(target);
  }

  #submitTarget() {
    const submit = this.element.querySelector("[type='submit']");
    invariant(
      submit instanceof HTMLInputElement || submit instanceof HTMLButtonElement,
    );
    return submit;
  }
}
