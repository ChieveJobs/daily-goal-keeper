import { useState } from 'react';
import { TextInput, useColorScheme } from 'react-native';

export default function ThemedTextInput({ style, ...props }) {
  const scheme = useColorScheme();
  const [focused, setFocused] = useState(false);

  // Define dynamic colors based on theme and focus state
  const borderColor = focused
    ? scheme === 'dark' ? '#60a5fa' : '#2563eb' // Focused blue
    : scheme === 'dark' ? '#444' : '#ccc';     // Default gray

  const backgroundColor = scheme === 'dark' ? '#1f2937' : '#f9fafb'; // gray-800 / gray-100
  const textColor = scheme === 'dark' ? '#fff' : '#000';
  const placeholderColor = scheme === 'dark' ? '#888' : '#999';

  return (
    <TextInput
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholderTextColor={placeholderColor}
      style={[
        {
          color: textColor,
          borderColor: borderColor,
          backgroundColor,
          borderWidth: 2,
          borderRadius: 12,
          padding: 12,
          fontSize: 18,
        },
        style,
      ]}
      {...props}
    />
  );
}
