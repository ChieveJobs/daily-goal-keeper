import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ThemedText from "./components/ThemedText";
import ThemedTextInput from "./components/ThemedTextInput";
import { loadTasks, saveTasks } from "./utils/storage";

export default function AddTask() {
  const { taskId, dateOfTask } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();

  const [tasks, setTasks] = useState([]);
  const [titleInput, onChangeTitleText] = useState("");
  const [descriptionInput, onChangeDescriptionText] = useState("");

  // Theme colors for buttons
  const green = colorScheme === "dark" ? "#34d399" : "#10b981";
  const red = colorScheme === "dark" ? "#f87171" : "#ef4444";
  const gray = colorScheme === "dark" ? "#6b7280" : "#d1d5db";

  useLayoutEffect(() => {
    navigation.setOptions({
      title: Number(taskId) ? "Edit Task" : "Add Task",
    });
  }, [taskId]);

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

  const cancel = () => router.back();

  const deleteTask = async () => {
    const updatedTasks = tasks.filter(task => task.id !== Number(taskId));
    setTasks(updatedTasks);
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
          ? { ...task, title: titleInput, description: descriptionInput, taskDate: dateOfTask }
          : task
      );
    } else {
      const maxId = tasks.reduce((max, task) => Math.max(max, task?.id ?? 0), 0);
      const newTask = {
        id: maxId + 1,
        title: titleInput,
        description: descriptionInput,
        taskDate: dateOfTask,
      };
      updatedTasks = [...tasks, newTask];
    }

    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedTextInput
        value={titleInput}
        placeholder="Title"
        onChangeText={onChangeTitleText}
        style={[styles.inputBox, styles.titleInput]}
      />
      <ThemedTextInput
        value={descriptionInput}
        multiline
        placeholder="Description"
        onChangeText={onChangeDescriptionText}
        style={[styles.inputBox, styles.descriptionInput]}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: green }]}
          onPress={saveTask}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.buttonText}>
            {Number(taskId) ? "Save" : "Add"}
          </ThemedText>
        </TouchableOpacity>

        {Number(taskId) ? (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: red }]}
            onPress={deleteTask}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.buttonText}>Delete</ThemedText>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: gray }]}
          onPress={cancel}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.buttonText}>Cancel</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  inputBox: {
    marginBottom: 16,
  },
  titleInput: {
    height: 50,
  },
  descriptionInput: {
    height: 150,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "auto",
    marginBottom: 20,
    zIndex: 9999
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 9999
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
