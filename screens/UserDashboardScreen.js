import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { FIRESTORE_DB } from '../FirebaseConfig';

export default function UserDashboardScreen() {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [menuVisible, setMenuVisible] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (currentUser) setCurrentUserId(currentUser.uid);

        const querySnapshot = await getDocs(collection(FIRESTORE_DB, 'users'));
        const userList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUsers(userList);
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const confirmDelete = (userId) => {
    Alert.alert(
      'Eliminar usuario',
      '¿Estás seguro de que deseas eliminar este usuario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(FIRESTORE_DB, 'users', userId));
              //muestra la lista actualizada sin el usuario eliminado
              setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
            } catch (error) {
              console.error('Error al eliminar usuario:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Usuarios registrados</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <Text style={styles.loadingText}>Cargando usuarios...</Text>
        ) : users.length === 0 ? (
          <Text style={styles.loadingText}>No se encontraron usuarios.</Text>
        ) : (
          users.map((user) => {
            const isCurrentUser = user.id === currentUserId;
            const isAdmin = user.role === 'administrator';
            const showMenu = !isCurrentUser && !isAdmin;

            return (
              <View key={user.id} style={styles.userRow}>
                <View style={styles.infoContainer}>
                  <Text style={styles.nameText}>{user.name}</Text>
                  <Text style={styles.emailText}>{user.email}</Text>
                </View>

                <View
                  style={[
                    styles.statusCircle,
                    { backgroundColor: user.is_active ? 'lightgreen' : 'tomato' },
                  ]}
                />

                {showMenu && (
                  <TouchableOpacity
                    onPress={() => setMenuVisible(menuVisible === user.id ? null : user.id)}
                    style={styles.menuButton}
                  >
                    <Ionicons name="ellipsis-vertical" size={20} color="#aaa" />
                  </TouchableOpacity>
                )}

                {menuVisible === user.id && (
                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => {
                      setMenuVisible(null);
                      confirmDelete(user.id);
                    }}
                  >
                    <Text style={styles.dropdownText}>Eliminar usuario</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
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
    padding: 16,
    backgroundColor: '#1a1a1a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    padding:20,
  },
  loadingText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e2e',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    position: 'relative',
  },
  infoContainer: {
    flex: 1,
  },
  nameText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  emailText: {
    color: '#ccc',
    fontSize: 12,
  },
  statusCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 8,
  },
  menuButton: {
    padding: 4,
  },
  dropdown: {
    position: 'absolute',
    right: 10,
    top: 45,
    backgroundColor: '#333',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    zIndex: 1,
  },
  dropdownText: {
    color: '#fff',
    fontSize: 13,
  },
});
