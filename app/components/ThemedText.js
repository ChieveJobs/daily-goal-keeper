import { Text, useColorScheme } from 'react-native';

export default function ThemedText({ style, ...props }) {
  const scheme = useColorScheme();
  const color = scheme === 'dark' ? 'white' : 'black';

  return <Text style={[{ color: color }, style]} {...props} />
}