import Octicons from "@expo/vector-icons/Octicons";
import { useColorScheme } from 'react-native';

export default function ThemedOcticon({ style, ...props }) {
  const scheme = useColorScheme();
  const color = scheme === 'dark' ? 'white' : 'black';

  return <Octicons style={[{ color: color }, style]} {...props} />
}