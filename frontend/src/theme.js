import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
    components: {
        MyTextField: {
            styleOverrides: {
                root: {},
            },
        },
        MyButton: {
            styleOverrides: {
                root: {},
            },
        },
    },

    typography: {
        fontFamily: "Roboto Slab, serif",
    },
    palette: {
        mode: "light",
        primary: {
            main: "#0052cc",
        },
        secondary: {
            main: "#edf2ff",
        },
    },
});

export const darkTheme = createTheme({
    components: {
        MyTextField: {
            styleOverrides: {
                root: {},
            },
        },
        MyButton: {
            styleOverrides: {
                root: {},
            },
        },
    },

    typography: {
        fontFamily: "Roboto Slab, serif",
    },
    palette: {
        mode: "dark",
        primary: {
            main: "#ffffff",
        },
        secondary: {
            main: "#1f1f1f",
        },
    },
});
