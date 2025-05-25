import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import GalleryScreen from './screens/GalleryScreen';
import ProfileScreen from './screens/ProfileScreen';
import UploadPhotoScreen from './screens/UploadPhotoScreen';
import RankingScreen from './screens/RankingScreen';
import EditProfileScreen from './screens/EditProfileScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Gallery" component={GalleryScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="UploadPhoto" component={UploadPhotoScreen} />
        <Stack.Screen name="Ranking" component={RankingScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}