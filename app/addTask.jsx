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
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradientTheme from "./components/LinearGradientTheme";
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
  const [titleHasError, setTitleHasError] = useState("");
  const [fromTimeHasError, setFromTimeHasError] = useState("");
  const [toTimeHasError, setToTimeHasError] = useState("");
  const [fromTimePickerVisible, setFromTimePickerVisible] = useState(false);
  const [toTimePickerVisible, setToTimePickerVisible] = useState(false);
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  //#endregion

  //#region Styles
  const SAVE_BUTTON = colorScheme === "dark" ? "#34d399" : "#10b981";
  const DELETE_BUTTON = colorScheme === "dark" ? "#f87171" : "#ef4444";
  const CANCEL_BUTTON = colorScheme === "dark" ? "#6b7280" : "#d1d5db";
  //#endregion

  const MODAL_OPTIONS = [
    { label: "High", value: "high" },
    { label: "Medium", value: "medium" },
    { label: "Low", value: "low" },
  ];

  //#region Animation
  const slideXtitle = useSharedValue(0);
  const animatedStyleTitle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideXtitle.value }],
  }));

  const titleErrorAnimation = () => {
    slideXtitle.value = withSequence(
      withTiming(30, { duration: 50 }),
      withTiming(-30, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const slideXfrom = useSharedValue(1);
  const animatedStyleFrom = useAnimatedStyle(() => ({
    transform: [{ translateX: slideXfrom.value }],
  }));

  const fromErrorAnimation = () => {
    slideXfrom.value = withSequence(
      withTiming(30, { duration: 50 }),
      withTiming(-30, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const slideXto = useSharedValue(2);
  const animatedStyleTo = useAnimatedStyle(() => ({
    transform: [{ translateX: slideXto.value }],
  }));

  const toErrorAnimation = () => {
    slideXto.value = withSequence(
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
        setFromTime(existingTask.from || "");
        setToTime(existingTask.to || "");
      }
    }
  }, [taskId, tasks]);

  const cancel = () => router.back();

  const displayAndSaveSelectedTime = (section, time) => {
    const formattedTime = time.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (section === "from") {
      setFromTime(formattedTime);
      setFromTimePickerVisible(false);
    } else {
      setToTime(formattedTime);
      setToTimePickerVisible(false);
    }
  };

  const deleteTask = async () => {
    const updatedTasks = tasks.filter((task) => task.id !== Number(taskId));
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
    router.back();
  };

  const saveTask = async () => {
    setTitleHasError("");
    setFromTimeHasError("");
    setToTimeHasError("");

    if (titleInput.trim() === "") {
      setTitleHasError("Title is required");
      titleErrorAnimation();
      return;
    }

    if (fromTime && toTime) {
      if (fromTime === toTime) {
        setFromTimeHasError("Start and end time can't be the same");
        setToTimeHasError("Start and end time can't be the same");
        fromErrorAnimation();
        toErrorAnimation();
        return;
      }

      if (fromTime > toTime) {
        setFromTimeHasError("Start time must be before end time");
        fromErrorAnimation();
        return;
      }
    }

    if (toTime && !fromTime) {
      setFromTimeHasError("Start time is required");
      fromErrorAnimation();
      return;
    }


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
            from: fromTime,
            to: toTime,
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
        from: fromTime,
        to: toTime,
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
      params: { dateOfTask },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradientTheme />
      <View style={styles.titleInputContainer}>
        <View style={styles.titleInputWrapper}>
          <ThemedText style={styles.inputLabel}>Title</ThemedText>
          <Animated.View style={animatedStyleTitle}>
            <ThemedTextInput
              hasError={titleHasError}
              value={titleInput}
              placeholder={titlePlaceHolderText}
              onChangeText={onChangeTitleText}
              style={[styles.inputBox, styles.titleInput]}
            />
          </Animated.View>
        </View>
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

      <View style={styles.labelWithOptional}>
        <ThemedText style={styles.inputLabel}>Description</ThemedText>
        <ThemedText style={styles.optionalLabel}>(optional)</ThemedText>
      </View>
      <ThemedTextInput
        value={descriptionInput}
        multiline
        placeholder="Description"
        onChangeText={onChangeDescriptionText}
        style={[styles.inputBox, styles.descriptionInput]}
      />

      <ThemedText style={styles.inputLabel}>Priority</ThemedText>
      <ThemedModalPicker
        selected={selectedPriority}
        onChange={setSelectedPriority}
        options={MODAL_OPTIONS}
      />

      <View style={styles.timeContainer}>
        {/* From Time Input */}
        <Animated.View style={[animatedStyleFrom, styles.timeSection]}>
          <View style={styles.labelWithOptional}>
            <ThemedText style={styles.timeLabel}>From</ThemedText>
            <ThemedText style={styles.optionalLabel}>(optional)</ThemedText>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setFromTimePickerVisible(true)}
          >
            <ThemedTextInput
              hasError={fromTimeHasError}
              placeholder="Select time"
              value={fromTime}
              editable={false}
              pointerEvents="none" // ensures no double-tap brings keyboard
              style={styles.inputBox}
            />
          </TouchableOpacity>
        </Animated.View>


        {/* To Time Input */}
        <Animated.View style={[animatedStyleTo, styles.timeSection]}>
          <View style={styles.labelWithOptional}>
            <ThemedText style={styles.timeLabel}>To</ThemedText>
            <ThemedText style={styles.optionalLabel}>(optional)</ThemedText>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setToTimePickerVisible(true)}
          >
            <ThemedTextInput
              hasError={toTimeHasError}
              placeholder="Select time"
              value={toTime}
              editable={false}
              pointerEvents="none"
              style={styles.inputBox}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>


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


      <DateTimePickerModal
        isVisible={fromTimePickerVisible}
        mode="time"
        onConfirm={(time) => displayAndSaveSelectedTime("from", time)}
        onCancel={() => setFromTimePickerVisible(false)}
      />
      <DateTimePickerModal
        isVisible={toTimePickerVisible}
        mode="time"
        onConfirm={(time) => displayAndSaveSelectedTime("to", time)}
        onCancel={() => setToTimePickerVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#374151",
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
    marginTop: 32,
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
  timeContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeSection: {
    flex: 1,
    marginRight: 10,
  },
  timeLabel: {
    marginBottom: 8,
    fontWeight: "500",
    fontSize: 16,
  },
  timeInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  timeText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#374151",
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
  optionalLabel: {
    fontSize: 12,
    fontWeight: "400",
    color: "#9ca3af",
    marginLeft: 6,
    marginTop: 3
  },
  labelWithOptional: {
    flexDirection: "row",
  },
});
