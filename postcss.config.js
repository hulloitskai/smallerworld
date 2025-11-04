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
        // "safari-only": {
        //   "_::-webkit-full-page-media, _:future, :root &": {
        //     "@mixin-content": {},
        //   },
        // },
        emoji: {
          "font-family": "var(--font-family-emoji)",
          "font-size-adjust": "0.5",
          "line-height": "1",
          "vertical-align": "middle",
        },
        "clamp-lightness": (_mixin, property, color, min, max) => ({
          [property]: `hsl(from ${color} h s clamp(${min}, l, ${max}))`,
          "@supports (color: hsl(from red h s calc(l - 20%)))": {
            [property]: `hsl(from ${color} h s clamp(${min}%, l, ${max}%))`,
          },
        }),
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
