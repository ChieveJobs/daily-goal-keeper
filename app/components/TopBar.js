import { useNavigation } from 'expo-router';
import { StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import ThemedOcticon from './ThemedOcticon';
import ThemedText from './ThemedText';

export default function TopBar({title, style, ...props }) {
    const colorScheme = useColorScheme();
    const navigation = useNavigation();
    const topBarColor =
        colorScheme === "dark"
            ? "rgba(39, 35, 35, 0.54)"
            : "rgba(255, 255, 255, 0.4)";

    const toggleDrawer = () => {
        navigation.toggleDrawer();
    }

    return <View style={[styles.topBarContainer, { backgroundColor: topBarColor }]}>
        <TouchableOpacity
            onPress={toggleDrawer}
            style={styles.hamburgerButton}
        >
            <ThemedOcticon name="three-bars" size={20} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>{title}</ThemedText>
    </View>
}
const styles = StyleSheet.create({
    topBarContainer: {
        height: "8%",
        width: "100%",
        justifyContent: "center",
        alignItems: "center"
    },
    hamburgerButton: {
        position: "absolute",
        width: 30,
        height: "100%",
        justifyContent: "center",
        margin: 20,
        right: 0
    },
    title: {
        fontSize: 16,
        fontWeight: "500"
    }
});