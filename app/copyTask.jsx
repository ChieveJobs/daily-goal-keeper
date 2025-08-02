import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter
} from "expo-router";
import { useCallback, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import ThemedModalPicker from "./components/ThemedModalPicker";
import ThemedText from "./components/ThemedText";
import { loadTasks, saveTasks } from "./utils/storage";

export default function CopyTask() {
  const { dateOfTask } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();

  const [tasks, setTasks] = useState([]);
  const [mode, setMode] = useState("");

  const [selectedPreviousTask, setSelectedPreviousTask] = useState("");

  const SAVE_BUTTON = colorScheme === "dark" ? "#34d399" : "#10b981";
  const CANCEL_BUTTON = colorScheme === "dark" ? "#6b7280" : "#d1d5db";

  const MODAL_OPTIONS = () => {
    const uniqueTasks = Array.from(
      new Map(tasks.map(item => [item.title, item])).values()
    );

    return uniqueTasks.map(task => ({
      label: task.title,
      value: task.title
    }));
  };

  const TASK_MODE_BACKGROUND_COLOR =
    mode === ""
      ? "white"
      : mode === "task"
        ? SAVE_BUTTON
        : CANCEL_BUTTON;
  const DAY_MODE_BACKGROUND_COLOR =
    mode === ""
      ? "white"
      : mode === "day"
        ? SAVE_BUTTON
        : CANCEL_BUTTON;

  const slideX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }]
  }));

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const loaded = await loadTasks();
        setTasks(loaded);
      })();
    }, [])
  );

  const switchMode = (mode) => {
    setMode(mode);
  }

  const cancel = () => router.back();

  const saveTask = async () => {
    if (mode === "task") {
      const previousTask = tasks.find(task => task.title === selectedPreviousTask);
      if (!previousTask) {
        console.log("Selected task not found");
        return;
      }

      const maxId = tasks.reduce(
        (max, task) => Math.max(max, task?.id ?? 0),
        0
      );

      const newTask = {
        id: maxId + 1,
        title: previousTask.title,
        description: previousTask.description,
        date: dateOfTask,
        priority: previousTask.priority?.toLowerCase().includes("high")
          ? "high"
          : previousTask.priority?.toLowerCase().includes("medium")
            ? "medium"
            : "low",
      };

      const updatedTasks = [...tasks, newTask];

      console.log("New task saved:", newTask);
      console.log("Total tasks now:", updatedTasks.length);

      setTasks(updatedTasks);
      await saveTasks(updatedTasks);

      router.replace("/");
    }
  };


  const modeTextColor = (backgroundColor) => {
    if (backgroundColor === SAVE_BUTTON) {
      return "white";
    }
    return colorScheme === "dark" ? "#d1d5db" : "#374151";
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[animatedStyle, styles.contentWrapper]}>

        <View style={styles.modeSelectContainer}>
          <TouchableOpacity
            onPress={() => switchMode("task")}
            style={{ flex: 1 }}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.selectMode,
                {
                  backgroundColor: TASK_MODE_BACKGROUND_COLOR,
                  shadowColor: TASK_MODE_BACKGROUND_COLOR === SAVE_BUTTON ? "#059669" : "#9ca3af",
                },
              ]}
            >
              <View style={{ backgroundColor: 'transparent' }}>
                <ThemedText style={[styles.modeText, { color: modeTextColor(TASK_MODE_BACKGROUND_COLOR) }]}>
                  Task
                </ThemedText>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => switchMode("day")}
            style={{ flex: 1, marginLeft: 15 }}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.selectMode,
                {
                  backgroundColor: DAY_MODE_BACKGROUND_COLOR,
                  shadowColor: DAY_MODE_BACKGROUND_COLOR === SAVE_BUTTON ? "#059669" : "#9ca3af",
                },
              ]}
            >
              <View style={{ backgroundColor: 'transparent' }}>
                <ThemedText style={[styles.modeText, { color: modeTextColor(DAY_MODE_BACKGROUND_COLOR) }]}>
                  Day
                </ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {mode !== "" && mode === "task" && (
          <View style={[styles.modeContainer, styles.taskModeContainer]}>
            <ThemedModalPicker
              label="Select previous task"
              selected={selectedPreviousTask}
              onChange={setSelectedPreviousTask}
              options={MODAL_OPTIONS()}
            />
          </View>
        )}

        {mode !== "" && mode === "day" && (
          <View style={[styles.modeContainer, styles.dayModeContainer]}>

          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: CANCEL_BUTTON }]}
            onPress={cancel}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.buttonText}>Cancel</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: SAVE_BUTTON }]}
            onPress={saveTask}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.buttonText}>Save</ThemedText>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  contentWrapper: {
    flex: 1,
    marginRight: 8,
  },
  modeSelectContainer: {
    flexDirection: "row",
    marginBottom: 40,
  },
  modeContainer: {
    height: "65%",
    borderWidth: 2,
    borderColor: "black"
  },
  selectMode: {
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: "transparent",
  },
  modeText: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
    textAlign: "center",
    backgroundColor: "transparent",
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
