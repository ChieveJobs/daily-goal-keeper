import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import { StyleSheet, useColorScheme, View } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const gradientColors =
    colorScheme === "dark"
      ? ["#000000", "#222222"] 
      : ["#a1c4fd", "#c2e9fb"]; 

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFill} />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: "transparent" },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ headerShown: false, title: "Index" }}
        />
        <Stack.Screen
          name="addTask"
          options={{ headerShown: true, title: "Add Task", animation: "slide_from_right" }}
        />
      </Stack>
    </View>
  );
}
