import { Stack } from "expo-router";
import { useColorScheme, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: "transparent" },
            headerStyle: {
              backgroundColor:
                colorScheme === "dark" ? "#645252ff" : "#95baf7ff",
            },
            headerTintColor: colorScheme === "dark" ? "white" : "black",
          }}
        >
        {/* Hide Stack header for the drawer screen */}
          <Stack.Screen 
            name="(drawer)" 
            options={{ headerShown: false }} 
          />
          <Stack.Screen
            name="addTask"
            options={{
              headerShown: true,
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="copyTask"
            options={{
              headerShown: true,
              animation: "slide_from_right",
              title: "Copy",
            }}
          />
        </Stack>
      </View>
    </GestureHandlerRootView>
  );
}
