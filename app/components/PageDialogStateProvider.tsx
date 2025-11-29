import {
  type PageDialogState,
  PageDialogStateContext,
} from "~/helpers/pageDialog";

const PageDialogStateProvider = ({ children }: PropsWithChildren) => {
  const [opened, setOpened] = useState(false);
  const state = useMemo<PageDialogState>(
    () => ({ opened, setOpened }),
    [opened, setOpened],
  );
  return (
    <PageDialogStateContext.Provider value={state}>
      {children}
    </PageDialogStateContext.Provider>
  );
};

export default PageDialogStateProvider;
