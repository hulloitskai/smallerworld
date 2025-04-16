const PageMeta: FC = () => {
  const { csrf, faviconLinks } = usePageProps();
  return (
    <Head>
      <meta head-key="csrf-param" name="csrf-param" content={csrf.param} />
      <meta head-key="csrf-token" name="csrf-token" content={csrf.token} />
      {faviconLinks.map(attributes => (
        <link {...attributes} />
      ))}
    </Head>
  );
};

export default PageMeta;
