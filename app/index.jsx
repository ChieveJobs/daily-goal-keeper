//#region Imports 
import Octicons from "@expo/vector-icons/Octicons";
import { useIsFocused } from "@react-navigation/native";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    SectionList,
    StyleSheet,
    TouchableOpacity,
    View,
    useColorScheme
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import AnimatedTaskItem from "./components/AnimatedTaskItem";
import ThemedOcticon from "./components/ThemedOcticon";
import ThemedText from "./components/ThemedText";
import { loadTasks, saveTasks } from "./utils/storage";
//#endregion

export default function TaskList() {
    // Hooks
    const [selectedDate, setDate] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const [visible, setVisible] = useState(true);
    const router = useRouter();
    const isFocused = useIsFocused();

    // Styles
    const colorScheme = useColorScheme();
    const checkboxContainerColor = colorScheme === "dark" ? "white" : "black";
    const fabColor = colorScheme === "dark"
        ? "rgba(52, 211, 153, 0.95)"
        : "rgba(16, 185, 129, 0.95)";
    const dateContainerColor =
        colorScheme === "dark"
            ? "rgba(39, 35, 35, 0.54)"
            : "rgba(255, 255, 255, 0.4)";

    // Animations for main container
    const slideX = useSharedValue(0);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: slideX.value }],
        opacity: opacity.value,
    }));

    const formattedDate = selectedDate.toLocaleDateString("en-GB");

    const getFilteredTasks = () => {
        return [
            {
                title: 'Completed',
                data: tasks.filter((task) => task.completed && task.date === formattedDate),
            },
            {
                title: 'High priority',
                data: tasks.filter((task) => task.priority === "high" && !task.completed && task.date === formattedDate),
            },
            {
                title: 'Medium priority',
                data: tasks.filter((task) => task.priority === "medium" && !task.completed && task.date === formattedDate),
            },
            {
                title: 'Low priority',
                data: tasks.filter((task) => task.priority === "low" && !task.completed && task.date === formattedDate),
            }
        ];
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
            runOnJS(handlePostSlideOut)(direction, offset);
        });
    };

    const handlePostSlideOut = (direction, offset) => {
        setVisible(false); 

        setTimeout(() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() + (direction === "forward" ? 1 : -1));
            setDate(newDate);

            slideX.value = -offset;

            setVisible(true);

            slideX.value = withTiming(0, { duration: 150 });
            opacity.value = withTiming(1, { duration: 150 });
        }, 10);
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
        .activeOffsetX([-15, 15])   
        .failOffsetY([-10, 10])     
        .onUpdate((e) => {
            slideX.value = e.translationX;
        })
        .onEnd((e) => {
            if (Math.abs(e.translationX) > 80) {
                const direction = e.translationX < 0 ? "forward" : "backward";
                runOnJS(adjustSelectedDate)(direction);
            } else {
                slideX.value = withTiming(0);
            }
        });

    const simultaneousGesture = Gesture.Simultaneous(panGesture);

    const sectionIsFinished = (section) => {
        if (section.title === "Completed") {
            return false;
        }

        if (section.data.filter((task) => !task.completed).length === 0) {
            return true;
        } else {
            return false;
        }
    }

    const getProgressBarSegments = () => {
        const filteredTasks = tasks.filter(task => task.date === formattedDate);

        const orderedTasks = [];

        for (const task of filteredTasks) {
            if (task.completed) orderedTasks.push(task);
        }

        for (const task of filteredTasks) {
            if (!task.completed) orderedTasks.push(task);
        }

        return orderedTasks.map((task, i) => (
            <View
                key={i}
                style={{
                    flex: 1,
                    backgroundColor: task.completed
                        ? colorScheme === "dark"
                            ? "rgba(34, 197, 94, 0.8)"
                            : "rgba(34, 197, 94, 0.6)"
                        : colorScheme === "dark"
                            ? "rgba(239, 68, 68, 0.4)"
                            : "rgba(239, 68, 68, 0.3)",
                }}
            />
        ));
    };

    const getProgressBarText = () => {
        const filteredTasks = tasks.filter((task) => task.date === formattedDate);
        const completedTasks = filteredTasks.filter((task) => task.completed);

        return <ThemedText>Completed tasks: {completedTasks.length} / {filteredTasks.length}</ThemedText>
    }

    const renderList = () => (
        <Animated.View style={animatedStyle}>
            <SectionList
                style={styles.sectionList}
                sections={getFilteredTasks()}
                SectionSeparatorComponent={() => <View style={{ height: 4 }} />}
                renderSectionHeader={({ section }) => {
                    return (
                        <View style={styles.sectionHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <ThemedOcticon name="checklist" size={16} color="#6b7280" style={{ marginRight: 6 }} />
                                <ThemedText style={styles.sectionHeaderText}>{section.title}</ThemedText>
                            </View>

                            {sectionIsFinished(section) && (
                                <View style={{ paddingTop: 4 }}>
                                    <ThemedText style={{ fontStyle: 'italic', color: '#6b7280' }}>
                                        All {section.title.toLocaleLowerCase()} tasks done. Good job!
                                    </ThemedText>
                                </View>
                            )}
                        </View>
                    );
                }}

                renderItem={({ item }) => (
                    <AnimatedTaskItem
                        item={item}
                        onPress={addTask}
                        onToggle={toggleTask}
                        colorScheme={colorScheme}
                        checkboxContainerColor={checkboxContainerColor}
                    />
                )}
            />
        </Animated.View>
    );

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

            <View style={styles.progressBarWrapper}>
                <View style={styles.progressBar}>
                    {getProgressBarSegments()}
                </View>
                <ThemedText style={styles.progressBarText}>{getProgressBarText()}</ThemedText>
            </View>
            {isFocused && visible && (
                <GestureDetector gesture={simultaneousGesture}>
                    {renderList()}
                </GestureDetector>
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
        alignItems: "center"
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
    progressBarWrapper: {
        width: "100%",
        height: 40,
        marginBottom: 16,
    },
    progressBar: {
        flexDirection: "row",
        height: 30,
        width: "100%",
        backgroundColor: "#6d6d6d3d",
        borderRadius: 6,
        overflow: "hidden",
    },
    progressBarText: {
        position: "absolute",
        top: 4,
        bottom: 0,
        left: 0,
        right: 0,
        textAlign: "center",
        fontWeight: "600",
        color: "#333",
        zIndex: 10,
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
    sectionList: {
        height: "100%",
    },
    sectionHeader: {
        paddingLeft: 20,
        paddingBottom: 10
    },
    sectionHeaderText: {
        fontSize: 16,
        fontWeight: "500"
    }
});