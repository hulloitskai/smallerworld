export default {
  plugins: {
    "postcss-preset-mantine": {
      autoRem: true,
      mixins: {
        "where-dark-user-theme": {
          ":where([data-mantine-color-scheme='dark']):where([data-user-theme]) &":
            {
              "@mixin-content": {},
            },
        },
      },
    },
    "postcss-simple-vars": {
      variables: {
        "mantine-breakpoint-xs": "36em",
        "mantine-breakpoint-sm": "48em",
        "mantine-breakpoint-md": "62em",
        "mantine-breakpoint-lg": "75em",
        "mantine-breakpoint-xl": "88em",
      },
    },
  },
};
