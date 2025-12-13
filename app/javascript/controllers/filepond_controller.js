import { Controller } from "@hotwired/stimulus";
import ImageEditorPlugin from "@pqina/filepond-plugin-image-editor";
import {
  createDefaultImageReader,
  createDefaultImageWriter,
  getEditorDefaults,
  openEditor,
  processImage,
} from "@pqina/pintura";
import { DirectUpload } from "@rails/activestorage";
import { create, registerPlugin } from "filepond";
import FilePosterPlugin from "filepond-plugin-file-poster";
import FileValidateTypePlugin from "filepond-plugin-file-validate-type";
import invariant from "tiny-invariant";

export default class extends Controller {
  static targets = ["input", "idleLabelTemplate"];
  static values = {
    directUploadUrl: String,
  };

  initialize() {
    registerPlugin(FileValidateTypePlugin, ImageEditorPlugin, FilePosterPlugin);
  }

  connect() {
    this.filepond = create(this.inputTarget, {
      labelIdle: this.idleLabelTemplateTarget.innerHTML,
      imageEditor: {
        createEditor: openEditor,
        imageReader: [createDefaultImageReader],
        imageWriter: [
          createDefaultImageWriter,
          // optional image writer instructions, this instructs the image writer to resize the image to match a width of 384 pixels
          {
            targetSize: {
              width: 128,
            },
          },
        ],
        imageProcessor: processImage,
        editorOptions: {
          ...getEditorDefaults(),
          imageCropAspectRatio: 1,
        },
      },

      // imageResizeTargetWidth: 200,
      // imageResizeTargetHeight: 200,
      stylePanelLayout: "compact circle",
      styleLoadIndicatorPosition: "center bottom",
      styleProgressIndicatorPosition: "right bottom",
      styleButtonRemoveItemPosition: "left bottom",
      styleButtonProcessItemPosition: "right bottom",
      server: {
        process: (fieldName, file, metadata, load, error, progress) => {
          const uploader = new DirectUpload(file, this.directUploadUrlValue, {
            directUploadWillStoreFileWithXHR: request => {
              request.upload.addEventListener("progress", event => {
                progress(event.lengthComputable, event.loaded, event.total);
              });
            },
          });
          uploader.create((responseError, blob) => {
            if (responseError) {
              error(responseError.message);
            } else {
              load(blob.signed_id);
            }
          });
        },
        revert: (signedId, load, error) => {
          fetch(`/filepond/files/${signedId}`, {
            method: "DELETE",
          }).then(load, error);
        },
        restore: null,
        load: null,
      },
    });
    this.filepond.on("processfilestart", () => {
      this.#markBusy();
    });
    this.filepond.on("processfiles", () => {
      this.#clearBusy();
    });
  }

  disconnect() {
    this.filepond?.destroy();
  }

  #filepondRootTarget() {
    const root = this.element.querySelector(".filepond--root");
    invariant(root instanceof HTMLElement);
    return root;
  }

  #markBusy() {
    this.element.setAttribute("aria-busy", "true");
  }

  #clearBusy() {
    this.element.removeAttribute("aria-busy");
  }
}
