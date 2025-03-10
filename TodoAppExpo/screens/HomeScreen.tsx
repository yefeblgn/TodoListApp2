import React, { useContext, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TodoContext } from '../contexts/TodoContext';
import { ThemeContext } from '../contexts/themeContext';
import HomeHeader from '../components/HomeHeader';
import TodoList from '../components/TodoItem';
import { getDynamicStyles } from '../utils/themeCheck';
import { listTodos } from '../api/process';

const HomeScreen: React.FC = () => {
  const { todos, setTodos, toggleTodo } = useContext(TodoContext);
  const { currentScheme } = useContext(ThemeContext);

  const dynamicStyles = getDynamicStyles(currentScheme);

  useEffect(() => {
    const fetchUserTodos = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (!userData) return;

        const user = JSON.parse(userData);
        const result = await listTodos(user.id);

        if (result.success) {
          setTodos(result.todos);
        } else {
          console.log('Todo listesi çekilemedi:', result.error);
        }
      } catch (error) {
        console.log('Hata:', error);
      }
    };

    fetchUserTodos();
  }, []);

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <HomeHeader />
      <TodoList
        todos={todos}
        onToggle={toggleTodo}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HomeScreen;
