const tokens = require("./design-system/tokens.json");

function color(name) {
  const value = tokens?.color?.[name]?.value;
  if (!value) throw new Error(`Missing canonical design token: color.${name}.value`);
  return value;
}

/** @type {const} */
// App semantic colors are derived from design-system/tokens.json so the
// authenticated app cannot silently drift from the locked Last Bench palette.
const themeColors = {
  primary: { light: color("brandGreen"), dark: color("brandGreenBright") },
  background: { light: color("warmWhite"), dark: color("appDarkBackground") },
  surface: { light: color("pureWhite"), dark: color("appDarkSurface") },
  foreground: { light: color("charcoal"), dark: color("warmWhite") },
  muted: { light: color("gray"), dark: color("softGray") },
  border: { light: color("sageGreen"), dark: color("appDarkBorder") },
  success: { light: color("success"), dark: color("successDark") },
  warning: { light: color("warning"), dark: color("warningDark") },
  error: { light: color("error"), dark: color("errorDark") },
};

module.exports = { themeColors };
