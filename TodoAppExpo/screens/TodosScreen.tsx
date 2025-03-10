import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/themeContext';
import { getDynamicStyles } from '../utils/themeCheck';
import TodoContent from '../components/TodoContent';

const TodosScreen: React.FC = () => {
  const navigation = useNavigation();
  const { currentScheme } = useTheme();
  const dynamicStyles = getDynamicStyles(currentScheme);

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <TodoContent />
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('AddTodo')}
      >
        <Image source={require('../assets/add.png')} style={styles.buttonImage} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  buttonImage: {
    width: 30,
    height: 30,
    tintColor: '#fff',
  },
});

export default TodosScreen;
