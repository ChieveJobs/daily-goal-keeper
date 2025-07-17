import { Stack } from "expo-router";

export default function RootLayout() {

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false, title: 'Index' }} />
      <Stack.Screen name="addTask" options={{ headerShown: true, title: 'Add Task', animation: 'slide_from_right' }} />
    </Stack>
  );
}
