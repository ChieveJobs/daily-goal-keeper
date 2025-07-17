import Octicons from "@expo/vector-icons/Octicons";
import { useRouter } from 'expo-router';
import { useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TaskList() {
    const router = useRouter();
    const [tasks, setTasks] = useState([
        { id: 1, title: "Buy groceries", completed: false },
        { id: 2, title: "Do laundry", completed: true },
        { id: 3, title: "Finish project", completed: false },
    ]);
    const addTask = () => {
        router.push('/addTask');
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
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity style={styles.floatingActionButton} onPress={addTask}>
                <Octicons name="diff-added" size={24} color={"white"} />
            </TouchableOpacity>
            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.taskContainer}>
                        <Text>{item.title}</Text>
                        <TouchableOpacity onPress={() => toggleTask(item.id)}>
                            <View style={styles.checkboxContainer}>
                                {item.completed && (
                                    <Octicons name="check" size={24} color="green" />
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white"
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
    },
    taskContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: "white",
        margin: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: "lightgray",
        borderRadius: 10,
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 3
    },
    checkboxContainer: {
        width: 26,
        height: 26,
        paddingLeft: 2,
        borderWidth: 2,
        borderColor: "green"
    }
});