import { type ModalProps } from "@mantine/core";
import { randomId } from "@mantine/hooks";

import {
  InstallModalBody,
  type InstallModalBodyProps,
} from "~/components/InstallModal";
import { isOutOfPWAScope, isStandaloneDisplayMode } from "~/helpers/pwa";
import { type WorldProfile } from "~/types";

import classes from "~/components/InstallModal.module.css";

interface InstallModalProps
  extends Pick<ModalProps, "title">,
    Omit<InstallModalBodyProps, "modalId"> {}

const openInstallModal = ({
  title,
  ...otherProps
}: InstallModalProps): void => {
  const modalId = randomId();
  openModal({
    modalId,
    title,
    className: classes.modal,
    children: <InstallModalBody {...{ modalId }} {...otherProps} />,
    withCloseButton: !(isStandaloneDisplayMode() && isOutOfPWAScope()),
  });
};

export const openUserWorldPageInstallModal = (world: WorldProfile): void =>
  openInstallModal({
    title: <>add your world to your home&nbsp;screen&nbsp;:)</>,
    arrowLabel: <>your world!</>,
    world,
  });

export const openWorldPageInstallModal = (world: WorldProfile): void =>
  openInstallModal({
    title: <>install {world.name} 📲</>,
    arrowLabel: <>it&apos;s me!</>,
    world,
  });

export const openAppInstallModal = (): void =>
  openInstallModal({
    title: <>install smaller world 📲</>,
    arrowLabel: <>smaller world</>,
  });
