import Octicons from '@expo/vector-icons/Octicons';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Drawer } from 'expo-router/drawer';
import { StyleSheet, View } from 'react-native';
import ThemedText from '../components/ThemedText';

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Daily Goal Keeper</ThemedText>
      </View>

      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 70,
    justifyContent: 'center',
    paddingLeft:10,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default function Layout() {
  return (
    <Drawer
      screenOptions={{
        swipeEnabled: false,
        headerShown: false,
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: 'Tasks',
          drawerIcon: ({ color, size }) => (
            <Octicons name="checklist" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="meditation"
        options={{
          title: 'Meditation',
          drawerIcon: ({ color, size }) => (
            <Octicons name="heart" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
