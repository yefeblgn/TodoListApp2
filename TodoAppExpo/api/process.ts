const BASE_URL = 'NGROK URL';

async function parseResponse(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('JSON parse error:', e, 'Response text:', text);
    return { success: false, error: 'Invalid JSON response from server' };
  }
}

export async function addTodo(user_id: number, title: string, description: string) {
  try {
    const response = await fetch(`${BASE_URL}/api/add-todo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, title, description }),
    });
    return await parseResponse(response);
  } catch (error) {
    console.error('addTodo hata:', error);
    return { success: false, error };
  }
}

export async function editTodo(id: number, user_id: number, title: string, description: string, is_completed: boolean) {
  try {
    const response = await fetch(`${BASE_URL}/api/edit-todo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, user_id, title, description, is_completed }),
    });
    return await parseResponse(response);
  } catch (error) {
    console.error('editTodo hata:', error);
    return { success: false, error };
  }
}

export async function deleteTodo(id: number, user_id: number) {
  try {
    const response = await fetch(`${BASE_URL}/api/delete-todo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, user_id }),
    });
    return await parseResponse(response);
  } catch (error) {
    console.error('deleteTodo hata:', error);
    return { success: false, error };
  }
}

export async function listTodos(user_id: number) {
  try {
    const response = await fetch(`${BASE_URL}/api/list-todo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id }),
    });
    return await parseResponse(response);
  } catch (error) {
    console.error('listTodos hata:', error);
    return { success: false, error };
  }
}

export async function registerUser(username: string, email: string, password: string) {
  try {
    const response = await fetch(`${BASE_URL}/api/newuser`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    return await parseResponse(response);
  } catch (error) {
    console.error('registerUser hata:', error);
    return { success: false, error };
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const response = await fetch(`${BASE_URL}/api/userlogin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return await parseResponse(response);
  } catch (error) {
    console.error('loginUser hata:', error);
    return { success: false, error };
  }
}

export async function deleteAccount(email: string, password: string) {
  try {
    const response = await fetch(`${BASE_URL}/api/delete-account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return await parseResponse(response);
  } catch (error) {
    console.error('deleteAccount hata:', error);
    return { success: false, error };
  }
}
