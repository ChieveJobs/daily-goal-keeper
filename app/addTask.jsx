import { SafeAreaView, StyleSheet, Text } from "react-native";
export default function AddTask() {
  return ( 
    <SafeAreaView style={styles.container}>
      <Text>Hej</Text>
    </SafeAreaView>     
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});