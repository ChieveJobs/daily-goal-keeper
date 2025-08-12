import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, useColorScheme } from "react-native";
export default function LinearGradientTheme({style, ...props }) {

    const colorScheme = useColorScheme();

    const gradientColors =
        colorScheme === "dark"
            ? ["#000000", "#222222"]
            : ["#a1c4fd", "#c2e9fb"];

    return <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFill}
    />;
}