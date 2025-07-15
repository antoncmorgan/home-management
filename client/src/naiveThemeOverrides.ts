// Naive UI theme overrides using CSS variables from main.css
import { GlobalThemeOverrides } from 'naive-ui';

const themeOverrides: GlobalThemeOverrides = {
  common: {
    fontFamily: "'Nunito', sans-serif",
    primaryColor: "#21888b",
    primaryColorHover: "#17696b",
    primaryColorPressed: "#18404a",
    textColorBase: "#18404a",
    textColorDisabled: "#7bb7b7",
    borderColor: "#21888b",
    baseColor: "#eafaf4",
    cardColor: "#ffffff",
    inputColor: "#ffffff",
    infoColor: "#21888b",
    infoColorHover: "#17696b",
    infoColorPressed: "#18404a",
    successColor: "#4be88a",
    successColorHover: "#38c86f",
    successColorPressed: "#2ea85c",
    warningColor: "#e8c84b",
    warningColorHover: "#d6b837",
    warningColorPressed: "#b39a2c",
    errorColor: "#e84b4b",
    errorColorHover: "#d63737",
    errorColorPressed: "#b32c2c"
  },
  Button: {
    // textColor: "#fff", // Button text color
  }
};

export default themeOverrides;
