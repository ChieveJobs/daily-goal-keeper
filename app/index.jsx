//#region Imports 
import Octicons from "@expo/vector-icons/Octicons";
import { useIsFocused } from "@react-navigation/native"; // 👈 NEW
import { BlurView } from "expo-blur";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import ThemedOcticon from "./components/ThemedOcticon";
import ThemedText from "./components/ThemedText";
import { loadTasks, saveTasks } from "./utils/storage";
//#endregion

export default function TaskList() {
    //Hooks
    const [selectedDate, setDate] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const router = useRouter();
    const isFocused = useIsFocused();

    //Styles
    const colorScheme = useColorScheme();
    const checkboxContainerColor = colorScheme === "dark" ? "white" : "black";
    const fabColor = colorScheme === "dark" ? "#34d399" : "#10b981";
    const dateContainerColor =
        colorScheme === "dark"
            ? "rgba(39, 35, 35, 0.54)"
            : "rgba(255, 255, 255, 0.4)";

    //Animations
    const slideX = useSharedValue(0);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: slideX.value }],
        opacity: opacity.value,
    }));

    const getFilteredTasks = () => {
        const formattedDate = selectedDate.toLocaleDateString("en-GB");
        return tasks.filter((task) => task.taskDate === formattedDate);
    };

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const load = async () => {
                const loaded = await loadTasks();
                if (isActive) {
                    setTasks(loaded);
                }
            };

            load();
            return () => {
                isActive = false;
            };
        }, [])
    );

    const adjustSelectedDate = (direction) => {
        const offset = direction === "forward" ? -300 : 300;

        slideX.value = withTiming(offset, { duration: 150 });
        opacity.value = withTiming(0, { duration: 150 }, () => {
            runOnJS(updateDate)(direction, offset);
        });
    };

    const updateDate = (direction, offset) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + (direction === "forward" ? 1 : -1));
        setDate(newDate);

        slideX.value = -offset;
        opacity.value = 0;

        slideX.value = withTiming(0, { duration: 150 });
        opacity.value = withTiming(1, { duration: 150 });
    };

    const addTask = (id) => {
        router.push({
            pathname: "/addTask",
            params: {
                taskId: id,
                dateOfTask: selectedDate.toLocaleDateString("en-GB"),
            },
        });
    };

    const toggleTask = (id) => {
        const updated = tasks.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        setTasks(updated);
        saveTasks(updated);
    };

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            slideX.value = e.translationX; 
        })
        .onEnd((e) => {
            if (Math.abs(e.translationX) > 80) {
                const direction = e.translationX < 0 ? "forward" : "backward";
                runOnJS(updateDate)(direction, e.translationX);
            } else {
                slideX.value = withTiming(0);
            }
        });


    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.dateContainer, { backgroundColor: dateContainerColor }]}>
                <TouchableOpacity
                    onPress={() => adjustSelectedDate("backward")}
                    style={[styles.dateButton, styles.dateBackwardButton]}
                >
                    <ThemedOcticon name="arrow-left" size={24} />
                </TouchableOpacity>
                <ThemedText>{selectedDate.toLocaleDateString("en-GB")}</ThemedText>
                <TouchableOpacity
                    onPress={() => adjustSelectedDate("forward")}
                    style={[styles.dateButton, styles.dateForwardButton]}
                >
                    <ThemedOcticon name="arrow-right" size={24} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.floatingActionButton, { backgroundColor: fabColor }]}
                onPress={addTask}
                activeOpacity={0.8}
            >
                <Octicons name="diff-added" size={24} color="white" />
            </TouchableOpacity>

            {/* ✅ Only apply gesture and animation when this screen is focused */}
            {isFocused ? (
                <GestureDetector gesture={panGesture}>
                    <Animated.View style={animatedStyle}>
                        <FlatList
                            style={styles.flatList}
                            data={getFilteredTasks()}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => addTask(item.id)} activeOpacity={0.9}>
                                    <BlurView
                                        intensity={colorScheme === "dark" ? 40 : 60}
                                        tint={colorScheme === "dark" ? "dark" : "light"}
                                        style={[
                                            styles.taskContainer,
                                            {
                                                backgroundColor:
                                                    colorScheme === "dark"
                                                        ? "rgba(28,28,30,0.6)"
                                                        : "rgba(255,255,255,0.7)",
                                                borderLeftColor: item.completed ? "#10b981" : "#fbbf24",
                                                borderLeftWidth: 6,
                                            },
                                        ]}
                                    >
                                        <View style={styles.taskTextContainer}>
                                            <ThemedText style={styles.taskTitle}>{item.title}</ThemedText>
                                            <ThemedText style={styles.taskSubtitle}>
                                                {item.completed ? "Completed" : "Pending"}
                                            </ThemedText>
                                        </View>
                                        <TouchableOpacity onPress={() => toggleTask(item.id)}>
                                            <View
                                                style={[
                                                    styles.checkboxContainer,
                                                    { borderColor: checkboxContainerColor },
                                                ]}
                                            >
                                                {item.completed && <ThemedOcticon name="check" size={20} />}
                                            </View>
                                        </TouchableOpacity>
                                    </BlurView>
                                </TouchableOpacity>
                            )}
                        />
                    </Animated.View>
                </GestureDetector>
            ) : (
                <FlatList
                    style={styles.flatList}
                    data={getFilteredTasks()}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => addTask(item.id)} activeOpacity={0.9}>
                            <BlurView
                                intensity={colorScheme === "dark" ? 40 : 60}
                                tint={colorScheme === "dark" ? "dark" : "light"}
                                style={[
                                    styles.taskContainer,
                                    {
                                        backgroundColor:
                                            colorScheme === "dark"
                                                ? "rgba(28,28,30,0.6)"
                                                : "rgba(255,255,255,0.7)",
                                        borderLeftColor: item.completed ? "#10b981" : "#fbbf24",
                                        borderLeftWidth: 6,
                                    },
                                ]}
                            >
                                <View style={styles.taskTextContainer}>
                                    <ThemedText style={styles.taskTitle}>{item.title}</ThemedText>
                                    <ThemedText style={styles.taskSubtitle}>
                                        {item.completed ? "Completed" : "Pending"}
                                    </ThemedText>
                                </View>
                                <TouchableOpacity onPress={() => toggleTask(item.id)}>
                                    <View
                                        style={[
                                            styles.checkboxContainer,
                                            { borderColor: checkboxContainerColor },
                                        ]}
                                    >
                                        {item.completed && <ThemedOcticon name="check" size={20} />}
                                    </View>
                                </TouchableOpacity>
                            </BlurView>
                        </TouchableOpacity>
                    )}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    dateContainer: {
        height: "8%",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 14,
    },
    dateButton: {
        position: "absolute",
        width: 30,
        height: "100%",
        justifyContent: "center",
        margin: 20,
    },
    dateBackwardButton: {
        left: 0,
    },
    dateForwardButton: {
        right: 0,
    },
    floatingActionButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        bottom: 80,
        right: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
        zIndex: 9999,
    },
    taskContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 14,
        borderRadius: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    taskTextContainer: {
        flex: 1,
        marginRight: 10,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 2,
    },
    taskSubtitle: {
        fontSize: 12,
        color: "#999",
    },
    checkboxContainer: {
        width: 26,
        height: 26,
        paddingLeft: 2,
        borderWidth: 2,
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
    },
    flatList: {
        height: "100%",
    },
});
