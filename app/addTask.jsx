import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { loadTasks, saveTasks } from "./utils/storage";

export default function AddTask() {
  const { taskId } = useLocalSearchParams();
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [titleInput, onChangeTitleText] = useState("");
  const [descriptionInput, onChangeDescriptionText] = useState("");
  const [newTaskAdded, setNewTaskAdded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const loaded = await loadTasks();
        setTasks(loaded);
      })();
    }, [])
  );

  useEffect(() => {
    if (Number(taskId) && tasks.length > 0) {
      const existingTask = tasks.find((t) => t.id === Number(taskId));
      if (existingTask) {
        onChangeTitleText(existingTask.title);
        onChangeDescriptionText(existingTask.description);
      }
    }
  }, [taskId, tasks]);

  const cancel = () => {
    router.back();
  };

  const addTask = () => {
    if (titleInput === "") {
      return;
    }

    const maxId = tasks.length !== 0
      ? tasks.reduce((max, task) => Math.max(max, task?.id ?? 0), 0)
      : 0;

    const newTask = {
      id: maxId + 1,
      title: titleInput,
      description: descriptionInput,
    };

    const updatedTasks = [...tasks, newTask];

    setTasks(updatedTasks);
    setNewTaskAdded(true);
  };

  useEffect(() => {
    if (newTaskAdded && tasks.length > 0) {
      saveTasks(tasks);
      setNewTaskAdded(false);
      router.back();

    }
  }, [newTaskAdded, tasks]);

  return (
    <SafeAreaView style={styles.container}>
      <TextInput value={titleInput} placeholder="Title" style={[styles.inputBox, styles.titleInput]} onChangeText={onChangeTitleText} />
      <TextInput value={descriptionInput} multiline={true} placeholder="Description" style={[styles.inputBox, styles.descriptionInput]} onChangeText={onChangeDescriptionText} />
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