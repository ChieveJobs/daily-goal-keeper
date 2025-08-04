//#region Imports
import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ThemedText from './ThemedText';
//#endregion

export default function ThemedModalPicker({
  hasError,
  label,
  options,
  selected,
  onChange,
}) {
  const [visible, setVisible] = useState(false);

  const borderColorError = '#ff0000ff';

  const handleSelect = (value) => {
    onChange(value);
    setVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.selector,
          hasError ? { borderColor: borderColorError, borderWidth: 1.5 } : {},
        ]}
        onPress={() => setVisible(true)}
      >
        <ThemedText style={styles.selectorText}>
          {selected ? options.find((o) => o.value === selected)?.label : label}
        </ThemedText>
      </TouchableOpacity>

      {hasError && hasError !== '' ? (
        <ThemedText
          style={{
            color: 'red',
            paddingLeft: 6,
            marginTop: -12,
            marginBottom: 8,
          }}
        >
          {hasError}
        </ThemedText>
      ) : null}

      <Modal
        transparent
        animationType="slide"
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.modalContent}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  selector: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb', // default light gray border
  },
  selectorText: {
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '50%',
  },
  option: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
  },
});
 