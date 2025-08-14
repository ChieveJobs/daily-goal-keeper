//#region Imports 
import { useEffect, useRef, useState } from "react";
import {
    StyleSheet,
    TouchableOpacity,
    View,
    useColorScheme
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TimerPickerModal } from "react-native-timer-picker";
import LinearGradientTheme from "../components/LinearGradientTheme";
import ThemedText from "../components/ThemedText";
import ThemedTextInput from "../components/ThemedTextInput";
import TopBar from "../components/TopBar";
//#endregion

export default function Meditation() {
    const [pickerVisible, setPickerVisible] = useState(false);
    const [timerIsRunning, setTimerIsRunning] = useState(false);
    const [alarmString, setAlarmString] = useState("");
    const [timeLeft, setTimeLeft] = useState(0);

    const intervalRef = useRef(null);
    const colorScheme = useColorScheme();

    const START_BUTTON = colorScheme === "dark" ? "#34d399" : "#10b981";
    const STOP_BUTTON = colorScheme === "dark" ? "#f87171" : "#ef4444";
    const SET_TIMER_BUTTON = colorScheme === "dark" ? "#6b7280" : "#d1d5db";

    const formatTime = ({ minutes, seconds }) => {
        return `${String(minutes ?? 0).padStart(2, "0")}:${String(seconds ?? 0).padStart(2, "0")}`;
    };

    const formatFromSeconds = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    const startTimer = () => {
        if (timeLeft > 0) {
            setTimerIsRunning(true);
        }
    };

    const stopTimer = () => {
        setTimerIsRunning(false);
    };

    useEffect(() => {
        if (timerIsRunning) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current);
                        setTimerIsRunning(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
    }, [timerIsRunning]);

    return (
        <SafeAreaView style={styles.safeAreaContainer}>
            <LinearGradientTheme />

            <TopBar title="Meditation" />

            <View style={styles.timerWrapper}>
                <View style={styles.timerContainer}>
                    <ThemedTextInput
                        placeholder="00:00"
                        editable={false}
                        style={styles.timerTextInput}
                    >
                        {formatFromSeconds(timeLeft)}
                    </ThemedTextInput>
                </View>
            </View>

            <View style={styles.buttonContainer}>
                {!timerIsRunning && (
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: SET_TIMER_BUTTON }]}
                        onPress={() => setPickerVisible(true)}
                        activeOpacity={0.8}
                    >
                        <ThemedText style={styles.buttonText}>Set timer</ThemedText>
                    </TouchableOpacity>
                )}

                {alarmString && (
                    !timerIsRunning ? (
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: START_BUTTON }]}
                            onPress={startTimer}
                            activeOpacity={0.8}
                        >
                            <ThemedText style={styles.buttonText}>Start</ThemedText>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: STOP_BUTTON }]}
                            onPress={stopTimer}
                            activeOpacity={0.8}
                        >
                            <ThemedText style={styles.buttonText}>Stop</ThemedText>
                        </TouchableOpacity>
                    )
                )}
            </View>

            <TimerPickerModal
                hideHours
                visible={pickerVisible}
                setIsVisible={setPickerVisible}
                onConfirm={(pickedDuration) => {
                    const totalSeconds = (pickedDuration.minutes || 0) * 60 + (pickedDuration.seconds || 0);
                    setTimeLeft(totalSeconds);
                    setAlarmString(formatTime(pickedDuration));
                    setPickerVisible(false);
                }}
                modalTitle="Set Alarm"
                closeOnOverlayPress
                styles={{
                    theme: colorScheme === "dark" ? "dark" : "light"
                }}
                modalProps={{
                    overlayOpacity: 0.2,
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeAreaContainer: {
        flex: 1
    },
    titleContainer: {
        alignItems: "center",
        flexDirection: "column",
        marginTop: 20
    },
    titleText: {
        fontSize: 36,
    },
    timerWrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    timerContainer: {
        alignItems: "center",
    },
    timerTextInput: {
        justifyContent: "center",
        width: 200,
        height: 80,
        fontSize: 40,
        textAlign: "center"
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: "auto",
        marginBottom: 20,
        marginLeft: 10,
        marginRight: 10
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
