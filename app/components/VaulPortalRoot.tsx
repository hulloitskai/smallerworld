import classes from "./VaulPortalRoot.module.css";

export interface VaulPortalRootProps {
  onMounted: (root: HTMLDivElement) => void;
  onUnmounted: () => void;
}

const VaulPortalRoot: FC<VaulPortalRootProps> = ({
  onMounted,
  onUnmounted,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (root) {
      onMounted(root);
      return onUnmounted;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div
      {...{ ref }}
      className={classes.root}
      data-vaul-portal-root
      data-vaul-no-drag
    />
  );
};

export default VaulPortalRoot;
