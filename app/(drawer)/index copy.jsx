//#region Imports 
import {
    StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ThemedText from "../components/ThemedText";
//#endregion

export default function Index() {
    return (
        <SafeAreaView style={styles.safeAreaContainer}>
            <ThemedText>Hej</ThemedText>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeAreaContainer: {
        flex: 1
    }
});
