import { useInViewport } from "@mantine/hooks";
import { type PropsWithChildren } from "react";

export interface LoadMoreButtonProps extends PropsWithChildren, BoxProps {
  loading: boolean;
  onVisible: () => void;
}

const LoadMoreButton: FC<LoadMoreButtonProps> = ({
  children,
  onVisible,
  ...otherProps
}) => {
  const { ref, inViewport } = useInViewport();
  useEffect(() => {
    if (inViewport) {
      onVisible();
    }
  }, [inViewport]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Button {...{ ref }} {...otherProps}>
      {children ?? "load more"}
    </Button>
  );
};

export default LoadMoreButton;
