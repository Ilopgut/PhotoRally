import React from 'react';
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import Menu from '../components/Menu';

const images = [
  { id: '1', uri: 'https://picsum.photos/200/300?random=1' },
  { id: '2', uri: 'https://picsum.photos/200/300?random=2' },
  { id: '3', uri: 'https://picsum.photos/200/300?random=3' },
  { id: '4', uri: 'https://picsum.photos/200/300?random=4' },
  { id: '5', uri: 'https://picsum.photos/200/300?random=5' },
];

const numColumns = 3;
const screenWidth = Dimensions.get('window').width;
const imageSize = screenWidth / numColumns - 10;

export default function GalleryScreen() {

  const routes = ['LoginScreen',
  'SignUpScreen',
  'HomeScreen',
  'ProfileScreen',
  'UploadPhotoScreen',
  'RankingScreen',
  'EditProfileScreen'];

  const renderItem = ({ item }) => (
    <View style={styles.imageContainer}>
      <Image source={{ uri: item.uri }} style={styles.image} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Menu routes={routes}/>
      <View style={{ height: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: '#0F0F23' }} />
      <StatusBar barStyle="light-content" />
      <FlatList
        data={images}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={numColumns}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  listContent: {
    padding: 5,
  },
  imageContainer: {
    margin: 5,
  },
  image: {
    width: imageSize,
    height: imageSize,
    borderRadius: 8,
  },
});
