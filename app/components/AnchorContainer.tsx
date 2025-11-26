import { type AnchorProps, type MantineColor } from "@mantine/core";
import { createPolymorphicComponent } from "@mantine/core";
import { type ComponentPropsWithRef } from "react";

import classes from "./AnchorContainer.module.css";

export interface AnchorContainerProps
  extends AnchorProps,
    Omit<ComponentPropsWithRef<"a">, "color" | "style"> {
  borderColor?: MantineColor;
}

const AnchorContainer = createPolymorphicComponent<"a", AnchorContainerProps>(
  forwardRef<HTMLAnchorElement, AnchorContainerProps>(
    ({ borderColor, style, className, children, ...otherProps }, ref) => (
      <Anchor
        {...{ ref }}
        className={cn("AnchorContainer", classes.container, className)}
        unstyled
        style={[
          style,
          theme => ({
            "--ac-active-border-color": getThemeColor(
              borderColor ?? theme.primaryColor,
              theme,
            ),
          }),
        ]}
        {...otherProps}
      >
        {children}
      </Anchor>
    ),
  ),
);

export default AnchorContainer;
