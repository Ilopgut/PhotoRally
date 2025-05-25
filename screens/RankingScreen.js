import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Menu from '../components/Menu';

const rankingData = [
  {
    uid: '1',
    name: 'María González',
    photo: 'https://via.placeholder.com/50',
    photos_submitted: 12,
    votes_given: 45,
  },
  {
    uid: '2',
    name: 'Carlos Pérez',
    photo: 'https://via.placeholder.com/50',
    photos_submitted: 10,
    votes_given: 40,
  },
  // Agrega más usuarios según sea necesario
];

export default function RankingScreen({ navigation }) {

  const routes = ['LoginScreen',
  'SignUpScreen',
  'GalleryScreen',
  'ProfileScreen',
  'UploadPhotoScreen',
  'HomeScreen',
  'EditProfileScreen'];

  const renderItem = ({ item, index }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.rank}>{index + 1}</Text>
      <Image source={{ uri: item.photo }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.stats}>
          Fotos: {item.photos_submitted} | Votos: {item.votes_given}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />

      <Menu routes={routes}/>
      <FlatList
        data={rankingData}
        keyExtractor={(item) => item.uid}
        renderItem={renderItem}
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
  header: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  listContent: {
    padding: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6C7CE7',
    width: 30,
    textAlign: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginHorizontal: 10,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  stats: {
    fontSize: 12,
    color: '#A0A0A0',
  },
});
