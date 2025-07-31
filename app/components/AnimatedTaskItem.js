import { BlurView } from "expo-blur";
import { useRef } from 'react';
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import ThemedText from "./ThemedText";

const ITEM_HEIGHT = 60;

const AnimatedTaskItem = ({
  item,
  onPress,
  onToggle,
  colorScheme,
  sectionsLayout,
  draggingItem,
  draggingY,
  onHoverSectionChange
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const lastHoverSection = useRef(null);

  const checkSectionHit = (absoluteY) => {
    if (!sectionsLayout.current || Object.keys(sectionsLayout.current).length === 0) {
      return null;
    }

    const hit = Object.entries(sectionsLayout.current).find(
      ([_, section]) => section.y <= absoluteY && absoluteY <= section.y + section.height
    );

    if (hit) {
      return hit[0];
    }

    return null;
  };

  // Wrap check + notify in one function
  const checkAndNotifySectionHit = (absoluteY) => {
    const hitSection = checkSectionHit(absoluteY);
    if (lastHoverSection.current !== hitSection) {
      lastHoverSection.current = hitSection;
      if (onHoverSectionChange) {
        onHoverSectionChange(hitSection);
      }
    }
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      draggingItem.value = item.id;
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;

      // Fix: Use .value for shared value assignment
      draggingY.value = event.absoluteY - ITEM_HEIGHT / 2;

      runOnJS(checkAndNotifySectionHit)(event.absoluteY);
    })
    .onEnd((event) => {
      // Animate back to original position
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      draggingItem.value = null;
      draggingY.value = 0;
      runOnJS(checkAndNotifySectionHit)(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    // Add zIndex when dragging to ensure item appears above others
    zIndex: draggingItem.value === item.id ? 1000 : 1,
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
    height: ITEM_HEIGHT,
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