import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { FIRESTORE_DB } from '../FirebaseConfig'; // Asegúrate de tener esto configurado

export default function ProfileScreen() {
  const navigation = useNavigation();
  const auth = getAuth();
  const [userData, setUserData] = useState(null);

  const getStatusColor = (isActive) => isActive ? '#4CAF50' : '#F44336';
  const getStatusText = (isActive) => isActive ? 'Activo' : 'Inactivo';
  const getRoleColor = (role) => role === 'admin' ? '#FF5722' : '#2196F3';
  const getRoleText = (role) => role === 'admin' ? 'Administrador' : 'Participante';

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(FIRESTORE_DB, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUserData({
            uid: user.uid,
            email: user.email,
            name: user.displayName || userDoc.data().name || "Nombre no disponible",
            is_active: userDoc.data().is_active ?? true,
            role: userDoc.data().role || 'participant',
            photos_submitted: userDoc.data().photos_submitted || 0,
            votes_given: userDoc.data().votes_given || 0,
          });
        }
      }
    };

    fetchUserData();
  }, []);

  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
        <View style={styles.loadingContainer}>
          <Text style={{ color: '#fff' }}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
          <Ionicons name="create-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Perfil */}
        <View style={styles.profileSection}>
          <View style={styles.imageContainer}>
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileInitial}>{getInitial(userData.name)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(userData.is_active) }]}>
              <Ionicons
                name={userData.is_active ? "checkmark-circle" : "close-circle"}
                size={16}
                color="#fff"
              />
            </View>
          </View>

          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userEmail}>{userData.email}</Text>

          <View style={[styles.roleBadge, { backgroundColor: getRoleColor(userData.role) }]}>
            <Text style={styles.roleText}>{getRoleText(userData.role)}</Text>
          </View>
        </View>

        {/* Estadísticas */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userData.photos_submitted}</Text>
            <Text style={styles.statLabel}>Fotos Enviadas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userData.votes_given}</Text>
            <Text style={styles.statLabel}>Votos Dados</Text>
          </View>
        </View>

        {/* Información del usuario */}
        <View style={styles.userInfoSection}>
          <Text style={styles.sectionTitle}>Información del Usuario</Text>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="mail-outline" size={20} color="#6C7CE7" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{userData.email}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="id-card-outline" size={20} color="#6C7CE7" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>UID</Text>
              <Text style={styles.infoValue}>{userData.uid}</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="shield-outline" size={20} color="#6C7CE7" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Rol</Text>
              <Text style={styles.infoValue}>{getRoleText(userData.role)}</Text>
            </View>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton} onPress={()=>{navigation.navigate("UploadPhoto")}}>
            <Ionicons name="camera-outline" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Subir Foto</Text>
          </TouchableOpacity>
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
    paddingTop: 10,
    backgroundColor: '#1a1a1a',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  profileImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#1a1a1a',
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6C7CE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#A0A0A0',
    marginBottom: 15,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6C7CE7',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#A0A0A0',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#333',
    marginHorizontal: 15,
  },
  userInfoSection: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a3a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#A0A0A0',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  activitySection: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
  },
  activityGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#2a2a3a',
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  activityNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    marginBottom: 5,
  },
  activityLabel: {
    fontSize: 12,
    color: '#A0A0A0',
    textAlign: 'center',
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
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6C7CE7',
    padding: 15,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: '#6C7CE7',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  profileInitial: {
    fontSize: 36,
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});