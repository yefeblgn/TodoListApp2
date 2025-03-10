import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  Modal,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/themeContext';
import { getDynamicStyles } from '../utils/themeCheck';
import { addTodo, editTodo, deleteTodo, listTodos } from '../api/process';

export interface TodoContentRef {
  openModal: (mode: 'add' | 'edit', todo?: any) => void;
}

const TodoContent = forwardRef<TodoContentRef>((props, ref) => {
  const { currentScheme } = useTheme();
  const dynamicStyles = getDynamicStyles(currentScheme);

  const [todos, setTodos] = useState<any[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentTodo, setCurrentTodo] = useState<any>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setUserId(user.id);
          const res = await listTodos(user.id);
          if (res.success) {
            setTodos(res.todos);
          } else {
            Alert.alert('Hata', 'Todo listesi alınamadı');
          }
        }
      } catch (error) {
        Alert.alert('Hata', 'Veri alınırken hata oluştu');
      }
    };
    fetchTodos();
  }, []);

  useImperativeHandle(ref, () => ({
    openModal: (mode: 'add' | 'edit', todo?: any) => {
      setModalMode(mode);
      if (mode === 'edit' && todo) {
        setCurrentTodo(todo);
        setTitle(todo.title);
        setDescription(todo.description);
        setTime(new Date(todo.time));
      } else {
        setTitle('');
        setDescription('');
        setTime(new Date());
      }
      setModalVisible(true);
    },
  }));

  const formatDate = (timeString: string) => {
    const dateObj = new Date(timeString);
    const day = dateObj.getDate();
    const monthName = new Intl.DateTimeFormat('tr-TR', { month: 'long' }).format(dateObj);
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    return `${day} ${monthName}, Saat ${hours}:${minutes}`;
  };

  const handleDelete = async (id: number) => {
    if (userId === null) return;
    const res = await deleteTodo(id, userId);
    if (res.success) {
      setTodos(todos.filter((todo) => todo.id !== id));
    } else {
      Alert.alert('Hata', 'Todo silinemedi');
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const handleModalSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Hata', 'Todo başlığı boş olamaz');
      return;
    }
    if (userId === null) return;
    setLoading(true);
    if (modalMode === 'add') {
      const res = await addTodo(userId, title, description, time.toISOString());
      if (res.success) {
        setTodos([...todos, { id: res.todo_id, user_id: userId, title, description, time: time.toISOString(), is_completed: false }]);
        setModalVisible(false);
      } else {
        Alert.alert('Hata', res.error || 'Todo eklenemedi');
      }
    } else {
      const res = await editTodo(currentTodo.id, userId, title, description, currentTodo.is_completed, time.toISOString());
      if (res.success) {
        setTodos(
          todos.map((todo) =>
            todo.id === currentTodo.id ? { ...todo, title, description, time: time.toISOString() } : todo
          )
        );
        setModalVisible(false);
      } else {
        Alert.alert('Hata', res.error || 'Todo güncellenemedi');
      }
    }
    setLoading(false);
  };

  const renderLeftActions = (progress: any, dragX: any, item: any) => (
    <TouchableOpacity
      style={[styles.leftAction, dynamicStyles.actionButton]}
      onPress={() => handleDelete(item.id)}
    >
      <Text style={styles.actionText}>Sil</Text>
    </TouchableOpacity>
  );

  const renderRightActions = (progress: any, dragX: any, item: any) => (
    <TouchableOpacity
      style={[styles.rightAction, dynamicStyles.actionButton]}
      onPress={() => ref && (ref as any).current.openModal('edit', item)}
    >
      <Text style={styles.actionText}>Düzenle</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: any }) => (
    <Swipeable
      renderLeftActions={(progress, dragX) => renderLeftActions(progress, dragX, item)}
      renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
    >
      <View style={[styles.todoCard, dynamicStyles.card]}>
        <Text style={[styles.todoTitle, dynamicStyles.cardText]}>{item.title}</Text>
        <Text style={[styles.todoDescription, dynamicStyles.cardText]}>{formatDate(item.time)}</Text>
      </View>
    </Swipeable>
  );

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={[styles.listContainer, dynamicStyles.container]}
      />
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, dynamicStyles.modalContainer]}>
            <Text style={[styles.modalTitle, dynamicStyles.modalTitle]}>
              {modalMode === 'add' ? 'Todo Ekle' : 'Todo Düzenle'}
            </Text>
            <TextInput
              placeholder="Başlık"
              value={title}
              onChangeText={setTitle}
              style={[styles.input, dynamicStyles.input]}
            />
            <TextInput
              placeholder="Açıklama (opsiyonel)"
              value={description}
              onChangeText={setDescription}
              style={[styles.input, dynamicStyles.input]}
            />
            <TouchableOpacity onPress={() => setDatePickerVisibility(true)} style={styles.dateButton}>
              <Text style={styles.dateButtonText}>{`Saat: ${formatDate(time.toISOString())}`}</Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="datetime"
              date={time}
              onConfirm={(selectedDate) => {
                setTime(selectedDate);
                setDatePickerVisibility(false);
              }}
              onCancel={() => setDatePickerVisibility(false)}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleModalCancel}>
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleModalSubmit}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {modalMode === 'add' ? 'Ekle' : 'Kaydet'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContainer: { padding: 16 },
  todoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 3,
  },
  todoTitle: { fontSize: 18, fontWeight: 'bold' },
  todoDescription: { fontSize: 14, marginTop: 4 },
  leftAction: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    flex: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  rightAction: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    flex: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 20,
    alignItems: 'flex-end',
  },
  actionText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  dateButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  dateButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default TodoContent;
