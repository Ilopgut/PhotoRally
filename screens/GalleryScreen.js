import React from 'react';
import {
  Text,
  View,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

export default function GalleryScreen({navigation}) {

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
      <FlatList
        data={images}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={numColumns}
        contentContainerStyle={styles.listContent}
      />


        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton} onPress={()=>{navigation.navigate("UploadPhoto")}}>
            <Ionicons name="camera-outline" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Subir Foto</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop:15,
    margin: 5,
  },
  image: {
    width: imageSize,
    height: imageSize,
    borderRadius: 8,
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C7CE7',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
