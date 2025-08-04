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
    //#region Hooks
    const router = useRouter();

    const isFocused = useIsFocused();

    const [selectedDate, setDate] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const [hoverSection, setHoverSection] = useState(null);

    const sectionsLayout = useRef({});
    const scrollViewRef = useRef(null);
    const sectionContainerRefs = useRef({});

    const draggingItem = useSharedValue(null);
    const draggingY = useSharedValue(0);
    //#endregion

    //#region Styles
    const colorScheme = useColorScheme();
    const fabColor = colorScheme === "dark"
        ? "rgba(52, 211, 153, 0.95)"
        : "rgba(16, 185, 129, 0.95)";
    const dateContainerColor =
        colorScheme === "dark"
            ? "rgba(39, 35, 35, 0.54)"
            : "rgba(255, 255, 255, 0.4)";
    //#endregion

    //#region Date
    const formattedDate = selectedDate.toLocaleDateString("en-GB");

    const adjustSelectedDate = (direction) => {
        const offset = direction === "forward" ? -300 : 300;

        opacity.value = withTiming(0, { duration: 150 }, () => {
            runOnJS(handlePostSlideOut)(direction, offset);
        });
    };
    //#endregion

    //#region Animations
    const slideX = useSharedValue(0);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: slideX.value }],
        opacity: opacity.value,
    }));

    const handleHoverSectionChange = (sectionTitle) => {
        setHoverSection(sectionTitle);
    };

    const handlePostSlideOut = (direction, offset) => {

        setTimeout(() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() + (direction === "forward" ? 1 : -1));
            setDate(newDate);

            slideX.value = -offset;

            slideX.value = withTiming(0, { duration: 150 });
            opacity.value = withTiming(1, { duration: 150 });

            setTimeout(() => {
                measureSectionLayouts();
            }, 200);
        }, 10);
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
                slideX.value = withTiming(
                    direction === "forward" ? -300 : 300,
                    { duration: 150 },
                    () => {
                        runOnJS(adjustSelectedDate)(direction);
                    }
                );
            } else {
                slideX.value = withTiming(0);
            }
        });

    const simultaneousGesture = Gesture.Simultaneous(panGesture);
    //#endregion

    //#region Tasks
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

    // Re-measure when tasks change
    const handleTasksChange = (newTasks) => {
        setTasks(newTasks);
        saveTasks(newTasks);
        setTimeout(() => {
            measureSectionLayouts();
        }, 50);
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

    const adjustTaskSection = (id, priority, completed) => {
        setTasks(prevTasks => {
            const updated = prevTasks.map(task =>
                task.id === id ? { ...task, priority, completed } : task
            );
            saveTasks(updated);
            setTimeout(measureSectionLayouts, 50);
            return updated;
        });

        setHoverSection("");
    };

    const sectionIsFinished = (section) => {
        if (section.title === "Completed") {
            return false;
        }

        if (section.data.filter((task) => !task.completed).length === 0) {
            return "All " + section.title.toLocaleLowerCase() + " tasks done. Good job!";
        } else {
            return false;
        }
    }

    const tasksNotEmpty = () => {
        return getFilteredTasks().some(section => section.data.length > 0);
    }
    //#endregion

    //#region Progress bar
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
    //#endregion

    //#region Layout
    useFocusEffect(
        useCallback(() => {
            const load = async () => {
                const loaded = await loadTasks();
                setTasks(loaded || []);
                setTimeout(() => {
                    measureSectionLayouts();
                }, 100);
            };
            load();
        }, [])
    );

    const measureSectionLayouts = () => {
        const sections = getFilteredTasks();

        sections.forEach((section) => {
            const sectionRef = sectionContainerRefs.current[section.title];
            if (sectionRef && sectionRef.measureInWindow) {
                sectionRef.measureInWindow((x, y, width, height) => {
                    sectionsLayout.current[section.title] = {
                        x,
                        y,
                        width,
                        height,
                    };
                });
            }
        });
    };

    const handleScrollViewLayout = () => {
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
                    {sections.map((section) => {
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
                                    isHovered && styles.hoveredSection
                                ]}
                                onLayout={() => {
                                    setTimeout(() => {
                                        measureSectionLayouts();
                                    }, 10);
                                }}
                            >
                                <View style={styles.sectionHeaderContainer}>
                                    <View style={styles.sectionHeaderTitle}>
                                        <ThemedOcticon name="checklist" size={16} color="#6b7280" style={styles.sectionHeaderIcon} />
                                        <ThemedText style={styles.sectionHeaderText}>{section.title}</ThemedText>
                                    </View>

                                    <View>
                                        <ThemedText style={styles.sectionEmptyText}>
                                            {sectionIsFinished(section)}
                                        </ThemedText>
                                    </View>
                                </View>

                                {section.data.map((item) => (
                                    <AnimatedTaskItem
                                        key={item.id}
                                        item={item}
                                        onPress={addTask}
                                        colorScheme={colorScheme}
                                        sectionsLayout={sectionsLayout}
                                        draggingItem={draggingItem}
                                        draggingY={draggingY}
                                        onHoverSectionChange={handleHoverSectionChange}
                                        onDraggingEnd={adjustTaskSection}
                                    />
                                ))}
                            </View>
                        );
                    })}
                </ScrollView>
            </Animated.View>
        );
    };
    //#endregion

    return (
        <SafeAreaView style={styles.safeAreaContainer}>
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
            {isFocused && (
                <GestureDetector gesture={simultaneousGesture}>
                    {renderList()}
                </GestureDetector>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeAreaContainer: {
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
    sectionList: {
        height: "88%"
    },
    sectionContainer: {
        marginVertical: 4,
    },
    sectionHeaderContainer: {
        marginLeft: 20,
        marginTop: 10
    },
    sectionHeaderTitle: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    sectionHeaderIcon: {
        marginRight: 6
    },
    sectionHeaderText: {
        fontSize: 16,
        fontWeight: "500"
    },
    sectionEmptyText: {
        fontStyle: 'italic',
        color: '#6b7280'
    },
    hoveredSection: {
        borderWidth: 2,
        borderColor: '#22c55e',
        borderRadius: 8,
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
    },
});