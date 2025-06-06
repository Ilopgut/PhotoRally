import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  StatusBar
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
  deleteDoc,
  increment
} from 'firebase/firestore';
import { FIRESTORE_DB } from '../FirebaseConfig';

export default function PhotoDetailScreen({ navigation, route }) {
  const { photo } = route.params;
  const auth = getAuth();
  const [userUID, setUserUID] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userVotesGiven, setUserVotesGiven] = useState(0);
  const [maxVotes, setMaxVotes] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchRallyConfig();
    if (userRole === 'participant') {
      checkUserVote();
    }
  }, [userRole]);

  const fetchUserData = async () => {
    const user = auth.currentUser;
    setUserUID(user.uid);
    if (user) {
      const userDocRef = doc(FIRESTORE_DB, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserRole(userData.role);
        setUserVotesGiven(userData.votes_given || 0);
      }
    }
  };

  const fetchRallyConfig = async () => {
    try {
      const configRef = collection(FIRESTORE_DB, 'rally_config');
      const configSnapshot = await getDocs(configRef);
      if (!configSnapshot.empty) {
        const configData = configSnapshot.docs[0].data();
        setMaxVotes(configData.max_votes_per_user || 5);
      }
    } catch (error) {
      console.error('Error fetching rally config:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserVote = async () => {
    const user = auth.currentUser;
    if (user) {
      const votesRef = collection(FIRESTORE_DB, 'votes');
      const q = query(
        votesRef,
        where('user_id', '==', user.uid),
        where('photo_id', '==', photo.photo_id)
      );
      const querySnapshot = await getDocs(q);
      setHasVoted(!querySnapshot.empty);
    }
  };

  const handleVote = async () => {
    if (userVotesGiven >= maxVotes) {
      Alert.alert('Límite alcanzado', `Ya has votado el máximo de ${maxVotes} fotos`);
      return;
    }

    if (hasVoted) {
      Alert.alert('Ya votaste', 'Ya has votado esta foto');
      return;
    }

    setActionLoading(true);
    try {
      const user = auth.currentUser;

      // Crear voto
      await addDoc(collection(FIRESTORE_DB, 'votes'), {
        photo_id: photo.photo_id,
        user_id: user.uid,
      });

      // Actualizar contador de votos de la foto
      const photoRef = doc(FIRESTORE_DB, 'photos', photo.id);
      await updateDoc(photoRef, {
        vote_count: increment(1)
      });

      // Actualizar contador de votos del usuario
      const userRef = doc(FIRESTORE_DB, 'users', user.uid);
      await updateDoc(userRef, {
        votes_given: increment(1)
      });

      setHasVoted(true);
      setUserVotesGiven(prev => prev + 1);
      Alert.alert('¡Voto registrado!', 'Tu voto ha sido guardado correctamente');

    } catch (error) {
      console.error('Error voting:', error);
      Alert.alert('Error', 'No se pudo registrar el voto');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const photoRef = doc(FIRESTORE_DB, 'photos', photo.id);
      await updateDoc(photoRef, {
        status: 'aprobado'
      });

      Alert.alert('Foto aprobada', 'La foto ya es visible para los participantes');
      navigation.goBack();
    } catch (error) {
      console.error('Error approving photo:', error);
      Alert.alert('Error', 'No se pudo aprobar la foto');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    Alert.alert(
      'Rechazar foto',
      '¿Estás seguro? Esta acción eliminará la foto permanentemente',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              // Eliminar votos relacionados
              const votesRef = collection(FIRESTORE_DB, 'votes');
              const q = query(votesRef, where('photo_id', '==', photo.photo_id));
              const votesSnapshot = await getDocs(q);

              for (const voteDoc of votesSnapshot.docs) {
                await deleteDoc(doc(FIRESTORE_DB, 'votes', voteDoc.id));
              }

              // Eliminar la foto
              await deleteDoc(doc(FIRESTORE_DB, 'photos', photo.id));

              // Actualizar contador de fotos del usuario
              const userRef = doc(FIRESTORE_DB, 'users', photo.user_id);
              await updateDoc(userRef, {
                photos_submitted: increment(-1)
              });

              Alert.alert('Foto rechazada', 'La foto ha sido eliminada');
              navigation.goBack();
            } catch (error) {
              console.error('Error rejecting photo:', error);
              Alert.alert('Error', 'No se pudo rechazar la foto');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
    <StatusBar/>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle de Foto</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Imagen */}
        <Image
          source={{ uri: photo.image_url }}
          style={styles.image}
          resizeMode="contain"
        />

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{photo.title}</Text>
          <Text style={styles.author}>Por {photo.user_name}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="heart" size={20} color="#6C7CE7" />
              <Text style={styles.statText}>{photo.vote_count} votos</Text>
            </View>

            {userRole === 'administrator' && (
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: photo.status === 'aprobado' ? '#4CAF50' : '#FF9800' }
                ]}>
                  <Text style={styles.statusText}>
                    {photo.status === 'aprobado' ? 'Aprobada' : 'Pendiente'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Botones de acción */}
        <View style={styles.actionsContainer}>
          {userRole === 'participant' && photo.status === 'aprobado' && userUID !== photo.user_id && (
            <TouchableOpacity
              style={[
                styles.voteButton,
                (hasVoted || userVotesGiven >= maxVotes) && styles.buttonDisabled
              ]}
              onPress={handleVote}
              disabled={actionLoading || hasVoted || userVotesGiven >= maxVotes}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name={hasVoted ? "heart" : "heart-outline"}
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.buttonText}>
                    {hasVoted ? 'Ya votaste' : `Votar (${userVotesGiven}/${maxVotes})`}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {userRole === 'administrator' && photo.status === 'pendiente' && (
            <View style={styles.adminButtons}>
              <TouchableOpacity
                style={[styles.approveButton, actionLoading && styles.buttonDisabled]}
                onPress={handleApprove}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Aprobar</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.rejectButton, actionLoading && styles.buttonDisabled]}
                onPress={handleReject}
                disabled={actionLoading}
              >
                <Ionicons name="close" size={20} color="#fff" />
                <Text style={styles.buttonText}>Rechazar</Text>
              </TouchableOpacity>
            </View>
          )}
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
    paddingTop: 20,
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
  image: {
    width: '100%',
    height: 400,
    backgroundColor: '#1a1a1a',
  },
  infoContainer: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    margin: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  author: {
    fontSize: 16,
    color: '#A0A0A0',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  actionsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C7CE7',
    padding: 15,
    borderRadius: 12,
  },
  adminButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 12,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    padding: 15,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
});