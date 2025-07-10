import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/client';

// Асинхронные действия
export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/users/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId) => {
    await apiClient.delete(`/users/${userId}/`);
    return userId;
  }
);

export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async ({ userId, isAdmin }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(`/users/${userId}/set_admin/`, {
        is_staff: isAdmin
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Создаем slice
const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    users: [],
    status: 'idle',
    error: null
  },
  reducers: {
    resetAdminState: (state) => {
      state.users = [];
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Получение списка пользователей
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      
      // Удаление пользователя
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user.id !== action.payload);
      })
      
      // Обновление пользователя
      .addCase(updateUser.fulfilled, (state, action) => {
        const updatedUser = action.payload;
        const index = state.users.findIndex(user => user.id === updatedUser.id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
      state.error = action.payload?.message || 'Ошибка при обновлении пользователя';
    });
  }
});

export const { resetAdminState } = adminSlice.actions;
export default adminSlice.reducer;

// Селекторы
export const selectAllUsers = (state) => state.admin.users;
export const selectAdminStatus = (state) => state.admin.status;
export const selectAdminError = (state) => state.admin.error;
