import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { loadTasks, saveTasks } from "./utils/storage";

export default function AddTask() {
  const { taskId, dateOfTask } = useLocalSearchParams();
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [titleInput, onChangeTitleText] = useState("");
  const [descriptionInput, onChangeDescriptionText] = useState("");

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

  const deleteTask = async () => {
    setTasks((prevTasks) => prevTasks.filter(task => task.id !== Number(taskId)));
    await saveTasks(updatedTasks);
    router.back();
  };

  const saveTask = async () => {
    if (titleInput.trim() === "") return;

    const id = Number(taskId);
    let updatedTasks;

    if (id) {
      updatedTasks = tasks.map(task =>
        task.id === id
          ? { ...task, title: titleInput, description: descriptionInput }
          : task
      );
    } else {
      const maxId = tasks.reduce((max, task) => Math.max(max, task?.id ?? 0), 0);
      const newTask = {
        id: maxId + 1,
        title: titleInput,
        description: descriptionInput,
        taskDate: dateOfTask
      };
      updatedTasks = [...tasks, newTask];
    }

    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
    router.back();
  };



  return (
    <SafeAreaView style={styles.container}>
      <TextInput value={titleInput} placeholder="Title" style={[styles.inputBox, styles.titleInput]} onChangeText={onChangeTitleText} />
      <TextInput value={descriptionInput} multiline={true} placeholder="Description" style={[styles.inputBox, styles.descriptionInput]} onChangeText={onChangeDescriptionText} />
      <TouchableOpacity style={[styles.button, styles.addButton]} onPress={saveTask}>
        <Text style={styles.buttonText}>{Number(taskId) ? "Edit" : "Add"}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={deleteTask}>
        <Text style={styles.buttonText}>Delete</Text>
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
  deleteButton: {
    backgroundColor: "red",
    position: "absolute",
    bottom: 40,
    left: "35%"
  },
  cancelButton: {
    backgroundColor: "lightgray",
    position: "absolute",
    bottom: 40,
    left: 10
  }
});