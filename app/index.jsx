//#region Imports 
import Octicons from "@expo/vector-icons/Octicons";
import { useIsFocused } from "@react-navigation/native";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
    ScrollView,
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

export default function Index() {
    // Hooks
    const [selectedDate, setDate] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const [visible, setVisible] = useState(true);
    const router = useRouter();
    const isFocused = useIsFocused();
    const sectionsLayout = useRef({});
    const scrollViewRef = useRef(null);
    const sectionContainerRefs = useRef({});
    const draggingItem = useSharedValue(null);
    const draggingY = useSharedValue(0);
    const [hoverSection, setHoverSection] = useState(null);


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

    const handleHoverSectionChange = (sectionTitle) => {
        setHoverSection(sectionTitle);
    };

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

    // Function to measure section layouts relative to ScrollView
    const measureSectionLayouts = () => {
        const sections = getFilteredTasks();

        sections.forEach((section) => {
            const sectionRef = sectionContainerRefs.current[section.title];
            if (sectionRef) {
                sectionRef.measureInWindow((x, y, width, height) => {
                    sectionsLayout.current[section.title] = {
                        x,
                        y,
                        width,
                        height,
                    };
                });
            } else {
            }
        });
    };


    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            const load = async () => {
                const loaded = await loadTasks();
                if (isActive) {
                    setTasks(loaded);
                    // Measure layouts after tasks are loaded and rendered
                    setTimeout(() => {
                        measureSectionLayouts();
                    }, 100);
                }
            };
            load();
            return () => {
                isActive = false;
            };
        }, [])
    );

    // Re-measure when tasks change
    const handleTasksChange = (newTasks) => {
        setTasks(newTasks);
        saveTasks(newTasks);
        // Re-measure layouts after state update
        setTimeout(() => {
            measureSectionLayouts();
        }, 50);
    };

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

            // Re-measure layouts when date changes
            setTimeout(() => {
                measureSectionLayouts();
            }, 200);
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

    const toggleTask = (id, priority, completed) => {
        const updated = tasks.map((task) =>
            task.id === id ? { ...task, priority: priority, completed: completed } : task
        );
        handleTasksChange(updated);
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

        if (section.data.filter((task) => !task.completed).length === 0 && section.data.length !== 0) {
            return "All " + section.title.toLocaleLowerCase() + " tasks done. Good job!";
        } if (section.data.filter((task) => !task.completed).length === 0 && section.data.length === 0) {
            return "No tasks added";
        } else {
            return false;
        }
    }

    const tasksNotEmpty = () => {
        return getFilteredTasks().some(section => section.data.length > 0);
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

    const handleScrollViewLayout = () => {
        // Measure section layouts when ScrollView is laid out
        setTimeout(() => {
            measureSectionLayouts();
        }, 50);
    };

    const renderList = () => {
        const sections = getFilteredTasks();

        return (
            <Animated.View style={animatedStyle}>
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.sectionList}
                    onLayout={handleScrollViewLayout}
                >
                    {sections.map((section, sectionIndex) => {
                        const isHovered = section.title === hoverSection;
                        return (
                            <View
                                key={section.title}
                                ref={(ref) => {
                                    if (ref) {
                                        sectionContainerRefs.current[section.title] = ref;
                                    }
                                }}
                                style={[
                                    styles.sectionContainer,
                                    isHovered && styles.hoveredSection, // add this
                                ]}
                                onLayout={() => {
                                    setTimeout(() => {
                                        measureSectionLayouts();
                                    }, 10);
                                }}
                            >
                                {/* Section Header */}
                                <View style={styles.sectionHeader}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <ThemedOcticon name="checklist" size={16} color="#6b7280" style={{ marginRight: 6 }} />
                                        <ThemedText style={styles.sectionHeaderText}>{section.title}</ThemedText>
                                    </View>

                                    <View style={{ paddingTop: 4 }}>
                                        <ThemedText style={{ fontStyle: 'italic', color: '#6b7280' }}>
                                            {sectionIsFinished(section)}
                                        </ThemedText>
                                    </View>
                                </View>

                                {/* Section Items */}
                                {section.data.map((item, itemIndex) => (
                                    <AnimatedTaskItem
                                        key={item.id}
                                        item={item}
                                        onPress={addTask}
                                        onToggle={toggleTask}
                                        colorScheme={colorScheme}
                                        checkboxContainerColor={checkboxContainerColor}
                                        sectionsLayout={sectionsLayout}
                                        draggingItem={draggingItem}
                                        draggingY={draggingY}
                                        onHoverSectionChange={handleHoverSectionChange}
                                    />
                                ))}
                            </View>
                        );
                    })}
                </ScrollView>
            </Animated.View>
        );
    };


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

            {tasksNotEmpty() && (
                <View style={styles.progressBarWrapper}>
                    <View style={styles.progressBar}>
                        {getProgressBarSegments()}
                    </View>
                    <ThemedText style={styles.progressBarText}>{getProgressBarText()}</ThemedText>
                </View>
            )}
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
    },
    progressBar: {
        flexDirection: "row",
        height: 30,
        width: "100%",
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
    sectionContainer: {
        marginVertical: 4
    },
    sectionHeader: {
        paddingLeft: 20,
        paddingBottom: 10,
    },
    sectionHeaderText: {
        fontSize: 16,
        fontWeight: "500"
    },
    hoveredSection: {
        borderWidth: 2,
        borderColor: '#22c55e', // bright green or any color you like
        borderRadius: 8,
        backgroundColor: 'rgba(34, 197, 94, 0.15)', // subtle green background highlight
    },
});