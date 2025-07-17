import { useRouter } from "expo-router";
import { StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddTask() {
  const router = useRouter();

  const cancel = () => {
    router.back();
  };

  const addTask = () => {
    router.back();
  }

  return (
    <SafeAreaView style={styles.container}>
      <TextInput placeholder="Title" style={[styles.inputBox, styles.titleInput]} />
      <TextInput multiline={true} placeholder="Description" style={[styles.inputBox, styles.descriptionInput]} />
      <TouchableOpacity style={[styles.button, styles.addButton]} onPress={addTask}>
        <Text style={styles.buttonText}>Add</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={cancel}>
        <Text style={styles.buttonText}>Cancel</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  inputBox: {
    fontSize: 24,
    borderWidth: 2,
    borderColor: "lightgray",
    padding: 10,
    marginTop: 10
  },
  titleInput: {

  },
  descriptionInput: {
    height: 200
  },
  button: {
    height: 40,
    width: "30%",
    borderRadius: 20,
    color: "black",
  },
  buttonText: {
    fontSize: 24,
    textAlign: "center",
    justifyContent: "center",
    paddingTop: 2
  },
  addButton: {
    backgroundColor: "green",
    position: "absolute",
    bottom: 40,
    right: 10
  },
  cancelButton: {
    backgroundColor: "lightgray",
    position: "absolute",
    bottom: 40,
    left: 10
  }
});