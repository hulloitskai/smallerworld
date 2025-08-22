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
}) => (
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
    <Button
      leftSection={<BackIcon />}
      onClick={() => {
        history.back();
      }}
    >
      back to previous page
    </Button>
  </Stack>
);

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
