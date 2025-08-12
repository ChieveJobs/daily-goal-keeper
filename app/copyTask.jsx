//#region Imports
import { CommonActions } from '@react-navigation/native';
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import { useCallback, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradientTheme from './components/LinearGradientTheme';
import ThemedModalPicker from "./components/ThemedModalPicker";
import ThemedText from "./components/ThemedText";
import ThemedTextInput from "./components/ThemedTextInput";
import { loadTasks, saveTasks } from "./utils/storage";
//#endregion

export default function CopyTask() {
  //#region Hooks
  const { dateOfTask } = useLocalSearchParams();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();

  const [tasks, setTasks] = useState([]);
  const [mode, setMode] = useState("");
  const [dateHasError, setDateHasError] = useState("");
  const [taskHasError, setTaskHasError] = useState("");
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedPreviousTask, setSelectedPreviousTask] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  //#endregion

  //#region Styles
  const SAVE_BUTTON = colorScheme === "dark" ? "#34d399" : "#10b981";
  const CANCEL_BUTTON = colorScheme === "dark" ? "#6b7280" : "#d1d5db";

  const getModeButtonColor = (buttonMode) =>
    mode === buttonMode ? SAVE_BUTTON : "white";

  const slideX = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
  }));

  const slideXtask = useSharedValue(1);
  const animatedStyleTask = useAnimatedStyle(() => ({
    transform: [{ translateX: slideXtask.value }],
  }));

  const taskErrorAnimation = () => {
    slideXtask.value = withSequence(
      withTiming(30, { duration: 50 }),
      withTiming(-30, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const slideXdate = useSharedValue(2);
  const animatedStyleDate = useAnimatedStyle(() => ({
    transform: [{ translateX: slideXdate.value }],
  }));

  const dateErrorAnimation = () => {
    slideXdate.value = withSequence(
      withTiming(30, { duration: 50 }),
      withTiming(-30, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const modeTextColor = (backgroundColor) => {
    if (backgroundColor === SAVE_BUTTON) {
      return "white";
    }
    return colorScheme === "dark" ? "#d1d5db" : "#374151";
  };
  //#endregion

  const MODAL_OPTIONS = () => {
    const uniqueTasks = Array.from(
      new Map(tasks.map((item) => [item.title, item])).values()
    );

    return uniqueTasks.map((task) => ({
      label: task.title,
      value: task.title,
    }));
  };

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
  };

  const displayAndSaveSelectedDate = (date) => {
    setSelectedDate(date.toLocaleDateString('en-GB'));
    setDatePickerVisible(false);
  }

  const cancel = () => navigation.goBack();

  const saveTask = async () => {
    setTaskHasError("");
    setDateHasError("");

    if (mode === "task") {
      if (selectedPreviousTask === "") {
        setTaskHasError("A task must be selected");
        taskErrorAnimation();
        return;
      }

      const previousTask = tasks.find(
        (task) => task.title === selectedPreviousTask
      );
      if (!previousTask) {
        return;
      }

      const maxId = tasks.reduce(
        (max, task) => Math.max(max, task?.id ?? 0),
        0
      );

      const priorityLower = (previousTask.priority ?? "").toLowerCase();

      const newTask = {
        id: maxId + 1,
        title: previousTask.title,
        description: previousTask.description,
        date: dateOfTask,
        priority: priorityLower.includes("high")
          ? "high"
          : priorityLower.includes("medium")
            ? "medium"
            : "low",
      };

      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      await saveTasks(updatedTasks);
    } else {
      if (selectedDate === "") {
        setDateHasError("A date must be selected");
        dateErrorAnimation();
        return;
      }

      const tasksOfDate = tasks
        .filter((task) => task.date === selectedDate)
        .map((task) => ({ ...task }));

      if (tasksOfDate.length > 0) {
        const maxId = tasks.reduce(
          (max, task) => Math.max(max, task?.id ?? 0),
          0
        );

        tasksOfDate.forEach((task, index) => {
          task.id = maxId + index + 1;
          task.date = dateOfTask;
        });

        const updatedTasks = [...tasks, ...tasksOfDate];
        setTasks(updatedTasks);
        await saveTasks(updatedTasks);
      }
    }

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "index", params: { dateOfTask } }],
      })
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradientTheme />
      <Animated.View style={[animatedStyle, styles.contentWrapper]}>
        <View style={styles.modeSelectContainer}>
          {["task", "date"].map((buttonMode, index) => {
            const isLast = index === 1;
            const bgColor = getModeButtonColor(buttonMode);
            const textColor = modeTextColor(bgColor);

            return (
              <TouchableOpacity
                key={buttonMode}
                onPress={() => switchMode(buttonMode)}
                style={[
                  styles.selectMode,
                  {
                    backgroundColor: bgColor,
                    marginLeft: isLast ? 15 : 0,
                    flex: 1,
                  },
                ]}
                activeOpacity={0.8}
              >
                <ThemedText style={[styles.modeText, { color: textColor }]}>
                  {buttonMode.charAt(0).toUpperCase() + buttonMode.slice(1)}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        {mode === "task" && (
          <Animated.View style={[animatedStyleTask, styles.modeContainer]}>
            <ThemedModalPicker
              hasError={taskHasError}
              label="Select previous task"
              selected={selectedPreviousTask}
              onChange={setSelectedPreviousTask}
              options={MODAL_OPTIONS()}
            />
          </Animated.View>
        )}

        {mode === "date" && (
          <Animated.View style={[animatedStyleDate, styles.modeContainer]}>
            <TouchableOpacity onPress={() => { setDatePickerVisible(true) }}>
              <ThemedTextInput hasError={dateHasError} editable={false} placeholder="Select a date" >{selectedDate}</ThemedTextInput>
            </TouchableOpacity>
          </Animated.View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: CANCEL_BUTTON }]}
            onPress={cancel}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.buttonText}>Cancel</ThemedText>
          </TouchableOpacity>
          {mode && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: SAVE_BUTTON }]}
              onPress={saveTask}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.buttonText}>Save</ThemedText>
            </TouchableOpacity>
          )}
        </View>
        <DateTimePickerModal
          isVisible={datePickerVisible}
          mode="date"
          onConfirm={(date) => {
            displayAndSaveSelectedDate(date);
          }}
          onCancel={() => setDatePickerVisible(false)}
        />
      </Animated.View>
    </SafeAreaView>
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
  },
  selectMode: {
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
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
