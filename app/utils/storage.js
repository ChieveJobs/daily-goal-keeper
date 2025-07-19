import AsyncStorage from "@react-native-async-storage/async-storage";

const TASKS_KEY = 'tasks';

export const loadTasks = async () => {
    try {
        const storedTasks = await AsyncStorage.getItem(TASKS_KEY);
        return storedTasks ? JSON.parse(storedTasks) : [];
    } catch (e) {
        console.error("Error loading data " + TASKS_KEY + ": " + e)
    }
};

export const saveTasks = async (tasks) => {
    try {
        await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (e) {
        console.error("Error saving data " + TASKS_KEY + ", " + e)
    }
};