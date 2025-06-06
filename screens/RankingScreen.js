import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { collection, getFirestore, query, orderBy, limit, getDocs } from 'firebase/firestore';
import Menu from '../components/Menu';

export default function RankingScreen({ navigation }) {
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(true);

  const routes = [
    'LoginScreen',
    'SignUpScreen',
    'GalleryScreen',
    'ProfileScreen',
    'HomeScreen',
  ];

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const db = getFirestore();
        const photosRef = collection(db, 'photos');
        const q = query(photosRef, orderBy('vote_count', 'desc'), limit(10));
        const snapshot = await getDocs(q);

        const topPhotos = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setRankingData(topPhotos);
      } catch (error) {
        console.error('Error fetching ranking data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

  const renderItem = ({ item, index }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.rank}>{index + 1}</Text>
      <Image source={{ uri: item.image_url }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text style={styles.name}>{item.user_name}</Text>
        <Text style={styles.stats}>
          Foto: "{item.title}" | Votos: {item.vote_count}
        </Text>
      </View>
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Aún no hay fotos en el concurso. ¡Sé el primero en participar!</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar/>
      <Menu routes={routes} />

      {loading ? (
        <ActivityIndicator size="large" color="#6C7CE7" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={rankingData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  listContent: {
    padding: 20,
    flexGrow: 1,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
  },
});
