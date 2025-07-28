import Octicons from "@expo/vector-icons/Octicons";
import { BlurView } from 'expo-blur';
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ThemedOcticon from "./components/ThemedOcticon";
import ThemedText from "./components/ThemedText";
import { loadTasks, saveTasks } from "./utils/storage";

export default function TaskList() {
    const [selectedDate, setDate] = useState(new Date());
    const router = useRouter();
    const [tasks, setTasks] = useState([]);
    const colorScheme = useColorScheme();
    const checkboxContainerColor = colorScheme === 'dark' ? 'white' : 'black';
    const fabColor = colorScheme === 'dark' ? "#645252ff" : "#95baf7ff";
    const dateContainerColor = colorScheme === 'dark' ? 'rgba(39, 35, 35, 0.54)' : 'rgba(255, 255, 255, 0.4)';

    const getFilteredTasks = () => {
        const formattedDate = selectedDate.toLocaleDateString('en-GB');
        return tasks.filter(task => task.taskDate === formattedDate);
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
        const newDate = new Date(selectedDate);
        if (direction === "forward") {
            newDate.setDate(newDate.getDate() + 1);
        } else {
            newDate.setDate(newDate.getDate() - 1);
        }

        setDate(newDate);
    };

    const addTask = (id) => {
        router.push({ pathname: '/addTask', params: { taskId: id, dateOfTask: new Date().toLocaleDateString('en-GB') } });
    };

    const toggleTask = (id) => {
        console.log(id);
        setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task.id === id
                    ? { ...task, completed: !task.completed }
                    : task
            )
        );

        saveTasks(tasks);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.dateContainer, { backgroundColor: dateContainerColor }]}>
                <TouchableOpacity onPress={() => adjustSelectedDate("backward")} style={[styles.dateButton, styles.dateBackwardButton]}>
                    <ThemedOcticon name="arrow-left" size={24} />
                </TouchableOpacity>
                <ThemedText>{selectedDate.toLocaleDateString('en-GB')}</ThemedText>
                <TouchableOpacity onPress={() => adjustSelectedDate("forward")} style={[styles.dateButton, styles.dateForwardButton]}>
                    <ThemedOcticon name="arrow-right" size={24} />
                </TouchableOpacity>
            </View >
            <TouchableOpacity style={[styles.floatingActionButton, { backgroundColor: fabColor }]} onPress={addTask}>
                <Octicons name="diff-added" size={24} color="white" />
            </TouchableOpacity>
            <FlatList
                data={getFilteredTasks()}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => addTask(item.id)}>
                        <BlurView intensity={colorScheme === 'dark' ? 50 : 70}  
                            tint="light"
                            style={styles.taskContainer}
                        >
                            <ThemedText>{item.title}</ThemedText>
                            <TouchableOpacity onPress={() => toggleTask(item.id)}>
                                <View style={[styles.checkboxContainer, {borderColor: checkboxContainerColor}]}>
                                    {item.completed && (
                                        <ThemedOcticon name="check" size={24} />
                                    )}
                                </View>
                            </TouchableOpacity>
                        </BlurView>
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    dateContainer: {
        height: "8%",
        width: "100%",
        backgroundColor: "green",
        justifyContent: "center",
        alignItems: "center"
    },
    dateButton: {
        position: "absolute",
        width: 30,
        height: "100%",
        color: "blue",
        justifyContent: "center",
        margin: 20
    },
    dateBackwardButton: {
        left: 0
    },
    dateForwardButton: {
        right: 0
    },
    floatingActionButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(60, 125, 17, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 60,
        right: 30,
        elevation: 5,
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 3,
        zIndex: 9999,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.48)',
    },
    taskContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        margin: 10,
        padding: 12,
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 5,
    },
    checkboxContainer: {
        width: 26,
        height: 26,
        paddingLeft: 2,
        borderWidth: 2,
        zIndex: 9999
    }
});