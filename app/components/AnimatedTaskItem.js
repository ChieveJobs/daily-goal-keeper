import { BlurView } from "expo-blur";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {
    Gesture,
    GestureDetector,
} from "react-native-gesture-handler";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import ThemedText from "./ThemedText";

const AnimatedTaskItem = ({
  item,
  onPress,
  onToggle,
  colorScheme,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd(() => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const handleToggle = () => onToggle(item.id);

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[animatedStyle]}>
        <TouchableOpacity onPress={() => onPress(item.id)} activeOpacity={0.9}>
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
                {item.date}
              </ThemedText>
            </View>
          </BlurView>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
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
    elevation: 3
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
});

export default AnimatedTaskItem;
