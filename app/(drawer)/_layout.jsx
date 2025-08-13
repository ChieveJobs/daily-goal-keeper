import { Drawer } from 'expo-router/drawer';

export default function Layout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
      }}
    >
      <Drawer.Screen
        name='index'
        options={{
          title: 'Tasks'
        }} />
      <Drawer.Screen
        name='meditation'
        options={{
          title: 'Meditation'
        }} />
    </Drawer>
  );
}
