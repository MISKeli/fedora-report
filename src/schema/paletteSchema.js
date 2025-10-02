import palette from "../styles/Colors/__palette.module.scss";

export const paletteSchema = {
  primary: {
    main: palette["primary-main"],
    light: palette["primary-light"],
    dark: palette["primary-dark"],
    contrastText: palette["primary-contrast-text"],
  },
  secondary: {
    main: palette["secondary-main"],
    light: palette["secondary-light"],
    dark: palette["secondary-dark"],
    contrastText: palette["secondary-contrast-text"],
  },
  info: {
    main: palette["info-main"],
    light: palette["info-light"],
    dark: palette["info-dark"],
    contrastText: palette["info-contrast-text"],
  },
  warning: {
    main: palette["warning-main"],
    light: palette["warning-light"],
    dark: palette["warning-dark"],
    contrastText: palette["warning-contrast-text"],
  },
  error: {
    main: palette["error-main"],
    light: palette["error-light"],
    dark: palette["error-dark"],
    contrastText: palette["error-contrast-text"],
  },
  success: {
    main: palette["success-main"],
    light: palette["success-light"],
    dark: palette["success-dark"],
    contrastText: palette["success-contrast-text"],
  },
  tertiary: {
    main: palette["tertiary-main"],
    light: palette["tertiary-light"],
    dark: palette["tertiary-dark"],
    contrastText: palette["tertiary-contrast-text"],
  },
  background: {
    default: palette["background-default"],
    paper: palette["background-paper"],
    header: palette["background-header"],
  },
  text: {
    primary: palette["text-primary"],
    secondary: palette["text-secondary"],
    disabled: palette["text-disabled"],
    hint: palette["text-hint"],
  },
  caution: {
    main: palette["caution-main"],
    light: palette["caution-light"],
    dark: palette["caution-dark"],
    contrastText: palette["caution-contrast-text"],
  },
  // Additional agricultural theme colors for special use cases
  theme: {
    earth: palette["earth-main"],
    sky: palette["sky-main"],
    sun: palette["sun-main"],
  },
};
