import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { FIREBASE_AUTH } from '../FirebaseConfig';

export default function Menu({ routes }) {
  const navigation = useNavigation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (authUser) => {
      setUser(authUser);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      toggleMenu();
      navigation.replace('Login'); // Asegúrate de que 'Login' está definido en el stack navigator
    } catch (error) {
      console.error('Error al cerrar sesión:', error.message);
    }
  };

  const todasLasRutas = [
    { screen: 'HomeScreen', label: 'Inicio' },
    { screen: 'LoginScreen', label: 'Iniciar sesión' },
    { screen: 'SignUpScreen', label: 'Registrarse' },
    { screen: 'GalleryScreen', label: 'Galería' },
    { screen: 'ProfileScreen', label: 'Perfil' },
    { screen: 'UploadPhotoScreen', label: 'Subir Foto' },
    { screen: 'RankingScreen', label: 'Ranking' },
    { screen: 'EditProfileScreen', label: 'Editar perfil' },
  ];

  const rutasFiltradas = todasLasRutas.filter(r => routes.includes(r.screen));

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
          <Text style={{ color: '#fff', fontSize: 35 }}>≡</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.appName}>PhotoRally</Text>
        </View>
      </View>

      {isMenuOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleMenu}
        />
      )}

      {isMenuOpen && (
        <View style={styles.sideMenu}>
          <View style={styles.menuHeader}>
            <View style={styles.userSection}>
              <View style={styles.avatarPlaceholder}>
                <Text style={{ color: '#fff', fontSize: 18 }}>
                  {user?.email?.charAt(0)?.toUpperCase() || 'I'}
                </Text>
              </View>

              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.displayName || user?.email || 'Invitado'}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeMenuButton} onPress={toggleMenu}>
              <Text style={{ color: '#fff', fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.menuItems}>
            {rutasFiltradas.map((ruta, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => {
                  navigation.navigate(ruta.screen.replace('Screen', ''));
                  toggleMenu();
                }}
              >
                <Text style={styles.menuItemText}>{ruta.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.menuFooter}>
            <TouchableOpacity style={styles.footerItem} onPress={handleSignOut}>
              <Text style={[styles.footerText, { color: '#E74C3C' }]}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
}

// (mantén aquí tu objeto `styles` igual que en tu código original)

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 10, // Account for status bar
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  menuButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 0,
    alignItems: 'center',
  },
  appName: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
  },
  sideMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#0F0F23',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuHeader: {
    backgroundColor: '#1a1a1a',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6C7CE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: '#A0A0A0',
  },
  closeMenuButton: {
    position: 'absolute',
    top: 55,
    right: 20,
    padding: 5,
  },
  menuItems: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuItemIcon: {
    width: 35,
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  menuFooter: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingVertical: 20,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#A0A0A0',
    marginLeft: 15,
    fontWeight: '500',
  },
});