import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

export default function Menu({ routes }) {
  const navigation = useNavigation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <View style={styles.menuContainer}>
      <TouchableOpacity style={styles.menuToggleButton} onPress={toggleMenu}>
        <View style={styles.toggleContainer}>
          <Text style={styles.appName}>PhotoRally</Text>
          {!isMenuOpen && (
            <View style={styles.hamburger}>
              <View style={styles.hamburgerLine} />
              <View style={styles.hamburgerLine} />
              <View style={styles.hamburgerLine} />
            </View>
          )}
        </View>
      </TouchableOpacity>
      {isMenuOpen && (
        <View style={styles.menu}>
          {routes.map((route, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuButton}
              onPress={() => {
                navigation.navigate(route);
                setIsMenuOpen(false);
              }}
            >
              <Text style={styles.menuText}>{route}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.closeButton} onPress={toggleMenu}>
            <View style={styles.arrowDown}>
              <View style={styles.arrowLineLeft} />
              <View style={styles.arrowLineRight} />
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  menuToggleButton: {
    backgroundColor: '#5459AC',
    paddingVertical: 25,
    paddingHorizontal: 20,
    marginTop: 40, // Account for status bar
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appName: {
    fontSize: 25,
    color: '#fff',
    fontWeight: '600',
  },
  hamburger: {
    width: 30,
    height: 22,
    justifyContent: 'space-between',
  },
  hamburgerLine: {
    width: '100%',
    height: 3,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  menu: {
    backgroundColor: '#5459AC',
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
  },
  menuButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '500',
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
  },
  arrowDown: {
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowLineLeft: {
    position: 'absolute',
    width: 14,
    height: 3,
    backgroundColor: '#fff',
    borderRadius: 2,
    transform: [{ rotate: '-45deg' }],
    left: 2,
  },
  arrowLineRight: {
    position: 'absolute',
    width: 14,
    height: 3,
    backgroundColor: '#fff',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
    right: 2,
  },
});