export default {
  plugins: {
    "postcss-preset-mantine": {
      autoRem: true,
      mixins: {
        "user-theme": {
          "[data-user-theme] &": {
            "@mixin-content": {},
          },
        },
        "where-user-theme": {
          ":where([data-user-theme]) &": {
            "@mixin-content": {},
          },
        },
        "light-user-theme": {
          "[data-mantine-color-scheme='light'][data-user-theme] &": {
            "@mixin-content": {},
          },
        },
        "where-light-user-theme": {
          ":where([data-mantine-color-scheme='light'][data-user-theme]) &": {
            "@mixin-content": {},
          },
        },
        "dark-user-theme": {
          "[data-mantine-color-scheme='dark'][data-user-theme] &": {
            "@mixin-content": {},
          },
        },
        "where-dark-user-theme": {
          ":where([data-mantine-color-scheme='dark'][data-user-theme]) &": {
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
    autoprefixer: {},
  },
};
