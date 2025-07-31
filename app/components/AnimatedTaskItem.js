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
  colorScheme,
  sectionsLayout,
  draggingItem,
  draggingY,
  onHoverSectionChange,
  onDraggingEnd
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const lastHoverSection = useRef(null);

  const checkAndNotifySectionHit = (absoluteY) => {
    const hitSection = checkSectionHit(absoluteY);
    if (lastHoverSection.current !== hitSection) {
      lastHoverSection.current = hitSection;
      if (onHoverSectionChange) {
        onHoverSectionChange(hitSection);
      }
    }
  };

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

  const adjustTaskSection = (id, absoluteY) => {
    const hitSection = checkSectionHit(absoluteY);
    
    if (hitSection === null) {
      return;
    }
    else if (hitSection !== 'Completed') {
      onDraggingEnd(id, hitSection.toLowerCase().replace(" priority", ""), false);
    } else {
      onDraggingEnd(id, hitSection, true);
    }
  }

  const panGesture = Gesture.Pan()
    .onStart(() => {
      draggingItem.value = item.id;
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;

      draggingY.value = event.absoluteY - ITEM_HEIGHT / 2;

      runOnJS(checkAndNotifySectionHit)(event.absoluteY);
    })
    .onEnd((event) => {
      runOnJS(adjustTaskSection)(draggingItem.value, event.absoluteY);
      runOnJS(onHoverSectionChange)(null);
      const springConfig = {
        damping: 20,
        stiffness: 150,
      };

      translateX.value = withSpring(0, springConfig);
      translateY.value = withSpring(0, springConfig);
      draggingItem.value = null;
      draggingY.value = 0;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    zIndex: draggingItem.value === item.id ? 1000 : 1,
  }));

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
});

export default AnimatedTaskItem;