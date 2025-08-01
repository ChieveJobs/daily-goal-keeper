import { useState } from 'react';
import { TextInput, useColorScheme } from 'react-native';

export default function ThemedTextInput({isRequiredButEmpty, style, ...props }) {
  const scheme = useColorScheme();
  const [focused, setFocused] = useState(false);

  const borderColor = focused 
    ? scheme === 'dark' ? '#60a5fa' : '#2563eb' 
    : scheme === 'dark' ? '#444' : '#ccc';    

  const borderColorError = '#ff0000ff'

  const backgroundColor = scheme === 'dark' ? '#1f2937' : '#f9fafb'; 
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
          borderColor: isRequiredButEmpty ? borderColorError : borderColor,
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
