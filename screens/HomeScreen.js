import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Menu from '../components/Menu';

export default function HomeScreen() {
  const routes = ['Login', 'SignUp', 'Gallery', 'Profile', 'UploadPhoto', 'Ranking'];

  return (
    <View style={styles.container}>
      <Menu routes={routes} />
      <Text>HomeScreen</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});