import { Code, Text } from "@mantine/core";

import BackIcon from "~icons/heroicons/arrow-uturn-left-20-solid";

import AppLayout from "~/components/AppLayout";

export interface ErrorPageProps extends SharedPageProps {
  title: string;
  description: string;
  code: number;
  error: string | null;
}

const ErrorPage: PageComponent<ErrorPageProps> = ({
  code,
  description,
  error,
  title,
}) => {
  const [hasPreviousPage, setHasPreviousPage] = useState<boolean>();
  useEffect(() => {
    setHasPreviousPage(history.length > 1);
  }, []);
  return (
    <Stack align="center">
      <Badge variant="outline" color="red">
        status {code}
      </Badge>
      <Stack align="center" gap={2} ta="center">
        <Title size="h2">{title}</Title>
        <Text c="dimmed">{description}</Text>
      </Stack>
      {!!error && (
        <Code block tt="none" style={{ alignSelf: "stretch" }}>
          error: {error}
        </Code>
      )}
      <Transition mounted={typeof hasPreviousPage === "boolean"}>
        {transitionStyle => (
          <Button
            leftSection={<BackIcon />}
            onClick={() => {
              if (hasPreviousPage) {
                history.back();
              } else {
                router.visit(routes.start.web.path());
              }
            }}
            style={transitionStyle}
          >
            {hasPreviousPage
              ? "back to previous page"
              : "back to smaller world"}
          </Button>
        )}
      </Transition>
    </Stack>
  );
};

ErrorPage.layout = page => (
  <AppLayout<ErrorPageProps>
    title={({ title }) => title}
    description={({ description }) => description}
    withContainer
    containerSize="xs"
    containerProps={{ my: "xl" }}
  >
    {page}
  </AppLayout>
);

export default ErrorPage;
