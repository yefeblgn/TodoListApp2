import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/themeContext';

const TodoItem = ({ title, description, completed }: any) => {
  const { theme }: any = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <Text style={{ color: theme.text }}>{title}</Text>
      {description && <Text style={{ color: theme.text }}>{description}</Text>}
      <Text style={{ color: theme.text }}>
        {completed ? 'Tamamlandı' : 'Beklemede'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
  },
});

export default TodoItem;
