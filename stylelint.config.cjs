module.exports = {
  extends: ["stylelint-config-standard"],
  plugins: ["stylelint-declaration-strict-value"],
  rules: {
    "scale-unlimited/declaration-strict-value": [
      ["/^color$/", "background-color", "border-color", "box-shadow", "font-size", "z-index"],
      { ignoreValues: ["inherit", "transparent", "currentColor", "var\\(.+\\)"], disableFix: true }
    ],
    "color-no-hex": true,
    "shorthand-property-no-redundant-values": true,
    "property-disallowed-list": [["margin","padding"], { message: "Use spacing tokens utilities or var(--heiwa-space-*)"}],
    "selector-class-pattern": ["^heiwa-[a-z0-9\\-]+$", { message: "Prefix widget classes with .heiwa-" }]
  }
};
