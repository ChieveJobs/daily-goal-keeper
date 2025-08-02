//#region Imports
import Octicons from "@expo/vector-icons/Octicons";
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import ThemedModalPicker from "./components/ThemedModalPicker";
import ThemedText from "./components/ThemedText";
import ThemedTextInput from "./components/ThemedTextInput";
import { loadTasks, saveTasks } from "./utils/storage";
//#endregion

export default function AddTask() {
  //#region Hooks
  const { taskId, dateOfTask } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const [tasks, setTasks] = useState([]);
  const [titleInput, onChangeTitleText] = useState("");
  const [descriptionInput, onChangeDescriptionText] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("high");
  const [titlePlaceHolderText, setTitlePlaceholderText] = useState("Title");
  const [titleIsEmpty, setTitleIsEmpty] = useState(false);
  //#endregion

  //#region Styles
  const SAVE_BUTTON = colorScheme === "dark" ? "#34d399" : "#10b981";
  const DELETE_BUTTON = colorScheme === "dark" ? "#f87171" : "#ef4444";
  const CANCEL_BUTTON = colorScheme === "dark" ? "#6b7280" : "#d1d5db";
  //#endregion

  const MODAL_OPTIONS = [
    { label: "High", value: "high" },
    { label: "Medium", value: "medium" },
    { label: "Low", value: "low" }
  ];

  //#region Animation
  const slideX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }]
  }));

  const titleRequiredAnimation = () => {
    slideX.value = withSequence(
      withTiming(30, { duration: 50 }),
      withTiming(-30, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };
  //#endregion
  
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
        setSelectedPriority(existingTask.priority || "");
      }
    }
  }, [taskId, tasks]);

  const cancel = () => router.back();

  const deleteTask = async () => {
    const updatedTasks = tasks.filter((task) => task.id !== Number(taskId));
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
    router.back();
  };

  const saveTask = async () => {
    if (titleInput.trim() === "") {
      setTitleIsEmpty(true);
      setTitlePlaceholderText("A title is required");
      titleRequiredAnimation();
      return;
    }

    setTitleIsEmpty(false);
    const id = Number(taskId);
    let updatedTasks;

    if (id) {
      updatedTasks = tasks.map((task) =>
        task.id === id
          ? {
            ...task,
            title: titleInput,
            description: descriptionInput,
            date: dateOfTask,
            priority: selectedPriority,
          }
          : task
      );
    } else {
      const maxId = tasks.reduce(
        (max, task) => Math.max(max, task?.id ?? 0),
        0
      );
      const newTask = {
        id: maxId + 1,
        title: titleInput,
        description: descriptionInput,
        date: dateOfTask,
        priority: selectedPriority,
      };
      updatedTasks = [...tasks, newTask];
    }

    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
    router.back();
  };

  const copyEarlierTasksModal = () => {
    router.push({
      pathname: "/copyTask",
      params: {
        dateOfTask: dateOfTask,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleInputContainer}>
        <Animated.View style={[animatedStyle, styles.titleInputWrapper]}>
          <ThemedTextInput
            isRequiredButEmpty={titleIsEmpty}
            value={titleInput}
            placeholder={titlePlaceHolderText}
            onChangeText={onChangeTitleText}
            style={[styles.inputBox, styles.titleInput]}
          />
        </Animated.View>
        <TouchableOpacity
          style={[styles.copyButton, { backgroundColor: SAVE_BUTTON }]}
          activeOpacity={0.8}
          onPress={copyEarlierTasksModal}
        >
          <ThemedText style={styles.buttonText}>
            <Octicons name="arrow-switch" size={16} color="white" />
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ThemedTextInput
        value={descriptionInput}
        multiline
        placeholder="Description"
        onChangeText={onChangeDescriptionText}
        style={[styles.inputBox, styles.descriptionInput]}
      />

      <ThemedModalPicker
        label="Select Priority"
        selected={selectedPriority}
        onChange={setSelectedPriority}
        options={MODAL_OPTIONS}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: CANCEL_BUTTON }]}
          onPress={cancel}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.buttonText}>Cancel</ThemedText>
        </TouchableOpacity>
        {Number(taskId) ? (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: DELETE_BUTTON }]}
            onPress={deleteTask}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.buttonText}>Delete</ThemedText>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: SAVE_BUTTON }]}
          onPress={saveTask}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.buttonText}>Save</ThemedText>
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
  titleInputContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  titleInputWrapper: {
    flex: 4,
    marginRight: 8,
  },
  titleInput: {
    height: 50,
  },
  copyButton: {
    marginTop: 2,
    flex: 1,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  inputBox: {
    marginBottom: 16,
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
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
