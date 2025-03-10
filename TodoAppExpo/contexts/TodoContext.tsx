import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/apiClient';

export const TodoContext = createContext<any>(null);

export const TodoProvider = ({ children }: any) => {
  const [todos, setTodos] = useState([]);

  const fetchTodos = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (!userData) return;

    const { id } = JSON.parse(userData);
    const res = await apiClient.post('/list-todo', { user_id: id });
    setTodos(res.data.todos);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const toggleTodo = (id: number) => {
  };

  return (
    <TodoContext.Provider value={{ todos, toggleTodo, fetchTodos }}>
      {children}
    </TodoContext.Provider>
  );
};
