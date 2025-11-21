export default {
  plugins: {
    "postcss-preset-mantine": {
      autoRem: true,
      mixins: {
        "world-theme": {
          "[data-world-theme] &": {
            "@mixin-content": {},
          },
        },
        "where-world-theme": {
          ":where([data-world-theme]) &": {
            "@mixin-content": {},
          },
        },
        "light-world-theme": {
          "[data-mantine-color-scheme='light'][data-world-theme] &": {
            "@mixin-content": {},
          },
        },
        "where-light-world-theme": {
          ":where([data-mantine-color-scheme='light'][data-world-theme]) &": {
            "@mixin-content": {},
          },
        },
        "dark-world-theme": {
          "[data-mantine-color-scheme='dark'][data-world-theme] &": {
            "@mixin-content": {},
          },
        },
        "where-dark-world-theme": {
          ":where([data-mantine-color-scheme='dark'][data-world-theme]) &": {
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
