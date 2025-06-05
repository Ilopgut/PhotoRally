import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  increment,
  deleteDoc
} from 'firebase/firestore';
import { FIRESTORE_DB } from '../FirebaseConfig';
import CloudinaryService from '../services/CloudinaryService';

const screenWidth = Dimensions.get('window').width;

export default function PhotoDetailScreen({ navigation, route }) {
  const { photo } = route.params;
  const auth = getAuth();
  const [hasVoted, setHasVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(photo.vote_count || 0);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    checkUserVote();
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(FIRESTORE_DB, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setUserRole(userDoc.data().role);
      }
    }
  };

  const checkUserVote = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const votesRef = collection(FIRESTORE_DB, 'votes');
      const q = query(
        votesRef,
        where('photo_id', '==', photo.photo_id),
        where('user_id', '==', user.uid)
      );

      const querySnapshot = await getDocs(q);
      setHasVoted(!querySnapshot.empty);
    } catch (error) {
      console.error('Error checking vote:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'Debes estar autenticado para votar');
      return;
    }

    // Verificar que no sea su propia foto
    if (photo.user_id === user.uid) {
      Alert.alert('Error', 'No puedes votar tu propia foto');
      return;
    }

    setVoting(true);
    try {
      if (hasVoted) {
        // Quitar voto
        const votesRef = collection(FIRESTORE_DB, 'votes');
        const q = query(
          votesRef,
          where('photo_id', '==', photo.photo_id),
          where('user_id', '==', user.uid)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          await deleteDoc(querySnapshot.docs[0].ref);

          // Decrementar contador en la foto
          const photoRef = doc(FIRESTORE_DB, 'photos', photo.id);
          await updateDoc(photoRef, {
            vote_count: increment(-1)
          });

          // Decrementar contador de votos dados del usuario
          const userRef = doc(FIRESTORE_DB, 'users', user.uid);
          await updateDoc(userRef, {
            votes_given: increment(-1)
          });

          setHasVoted(false);
          setVoteCount(prev => prev - 1);
        }
      } else {
        // Agregar voto
        await addDoc(collection(FIRESTORE_DB, 'votes'), {
          photo_id: photo.photo_id,
          user_id: user.uid,
          created_at: new Date(),
        });

        // Incrementar contador en la foto
        const photoRef = doc(FIRESTORE_DB, 'photos', photo.id);
        await updateDoc(photoRef, {
          vote_count: increment(1)
        });

        // Incrementar contador de votos dados del usuario
        const userRef = doc(FIRESTORE_DB, 'users', user.uid);
        await updateDoc(userRef, {
          votes_given: increment(1)
        });

        setHasVoted(true);
        setVoteCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error voting:', error);
      Alert.alert('Error', 'Error al procesar el voto');
    } finally {
      setVoting(false);
    }
  };

  const canVote = () => {
    return userRole === 'participant' && photo.user_id !== auth.currentUser?.uid;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C7CE7" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle de Foto</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Imagen principal */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: CloudinaryService.getOptimizedUrl(photo.image_url, screenWidth - 40, screenWidth - 40) }}
            style={styles.mainImage}
            resizeMode="cover"
          />
        </View>

        {/* Información de la foto */}
        <View style={styles.infoSection}>
          <Text style={styles.photoTitle}>{photo.title}</Text>

          <View style={styles.authorInfo}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorInitial}>
                {photo.user_name ? photo.user_name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
            <View style={styles.authorDetails}>
              <Text style={styles.authorName}>{photo.user_name || 'Usuario'}</Text>
              <Text style={styles.publishDate}>
                {photo.created_at?.toDate?.()?.toLocaleDateString() || 'Fecha no disponible'}
              </Text>
            </View>
          </View>

          {/* Estadísticas */}
          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <Ionicons name="heart" size={20} color="#E63946" />
              <Text style={styles.statText}>{voteCount} votos</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="eye" size={20} color="#6C7CE7" />
              <Text style={styles.statText}>Ver detalles</Text>
            </View>
          </View>

          {/* Botón de voto */}
          {canVote() && (
            <TouchableOpacity
              style={[
                styles.voteButton,
                hasVoted && styles.voteButtonActive,
                voting && styles.voteButtonDisabled
              ]}
              onPress={handleVote}
              disabled={voting}
            >
              {voting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name={hasVoted ? "heart" : "heart-outline"}
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.voteButtonText}>
                    {hasVoted ? 'Quitar voto' : 'Votar foto'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Información adicional */}
          <View style={styles.additionalInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="information-circle-outline" size={20} color="#6C7CE7" />
              <Text style={styles.infoText}>
                {photo.user_id === auth.currentUser?.uid
                  ? 'Esta es tu foto'
                  : 'Foto de otro participante'
                }
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#4CAF50" />
              <Text style={styles.infoText}>Estado: {photo.image_status}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    padding: 20,
    alignItems: 'center',
  },
  mainImage: {
    width: screenWidth - 40,
    height: screenWidth - 40,
    borderRadius: 15,
  },
  infoSection: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    margin: 20,
    borderRadius: 15,
  },
  photoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6C7CE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  authorInitial: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  publishDate: {
    color: '#A0A0A0',
    fontSize: 14,
    marginTop: 2,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#333',
    marginVertical: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C7CE7',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  voteButtonActive: {
    backgroundColor: '#E63946',
  },
  voteButtonDisabled: {
    backgroundColor: '#4a4a5a',
  },
  voteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  additionalInfo: {
    marginTop: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    color: '#A0A0A0',
    fontSize: 14,
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});