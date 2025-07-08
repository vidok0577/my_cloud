import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/client';

export const fetchFiles = createAsyncThunk(
  'files/fetchFiles',
  async (userId = null, { getState }) => {
    const { user } = getState().auth;
    const params = {};
    
    if (user.is_staff && userId) {
      params.user_id = userId;
    }

    const response = await apiClient.get('/api/files/', { params });
    return response.data;
  }
);

export const updateFileComment = createAsyncThunk(
  'files/updateFileComment',
  async ({ fileId, comment }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(
        `/api/files/${fileId}/update_comment/`,
        { comment },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Ошибка обновления комментария');
    }
  }
);

export const uploadFile = createAsyncThunk(
    'files/uploadFile',
    async ({ file, comment = '' }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('comment', comment);

            const response = await apiClient.post('/api/files/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Ошибка загрузки файла');
        }
    }
);

export const deleteFile = createAsyncThunk(
  'files/deleteFile',
  async (fileId, isAdmin) => {
    if (isAdmin) {
      // Для администратора используем специальный эндпоинт
      await apiClient.delete(`/api/files/${fileId}/admin_delete/`);
    } else {
      // Для обычного пользователя стандартный эндпоинт
      await apiClient.delete(`/api/files/${fileId}/`);
    }
    
    return fileId;
  }
);

export const downloadFile = createAsyncThunk(
  'files/downloadFile',
  async (fileId, { getState }) => {
    const response = await apiClient.get(`/api/files/${fileId}/download/`, {
      responseType: 'blob'
    });
    
    const { files } = getState().files;
    const file = files.find(f => f.id === fileId);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', file.original_name);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return fileId;
  }
);

export const fetchAdminFiles = createAsyncThunk(
  'files/fetchAdminFiles',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/api/users/${userId}/files/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const filesSlice = createSlice({
  name: 'files',
  initialState: {
    files: [],
    status: 'idle',
    error: null,
    uploadProgress: 0
  },
  reducers: {
    resetFilesState: (state) => {
      state.files = [];
      state.status = 'idle';
      state.error = null;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Загрузка файлов
      .addCase(fetchFiles.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.files = action.payload || [];
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      
      // Загрузка нового файла
      .addCase(uploadFile.pending, (state) => {
        state.status = 'uploading';
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.files.unshift(action.payload);
        state.uploadProgress = 0;
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
        state.uploadProgress = 0;
      })
      
      // Удаление файла
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.files = state.files.filter(file => file.id !== action.payload);
      })
      
      // Скачивание файла
      .addCase(downloadFile.fulfilled, (state, action) => {
        const fileId = action.payload;
        const fileIndex = state.files.findIndex(file => file.id === fileId);
        if (fileIndex !== -1) {
          state.files[fileIndex].last_download = new Date().toISOString();
        }
      })

      // Обновление комментария
      .addCase(updateFileComment.pending, (state) => {
        state.status = 'updating';
      })
      .addCase(updateFileComment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedFile = action.payload;
        state.files = state.files.map(file => 
          file.id === updatedFile.id ? updatedFile : file
        );
      })
      .addCase(updateFileComment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Получаем список файлов пользователя для админа
      .addCase(fetchAdminFiles.fulfilled, (state, action) => {
      state.files = action.payload;
      state.status = 'succeeded';
      })
      .addCase(fetchAdminFiles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
    }
});

export const { resetFilesState, setUploadProgress } = filesSlice.actions;
export default filesSlice.reducer;

// Селекторы
export const selectAllFiles = (state) => state.files.files;
export const selectFilesStatus = (state) => state.files.status;
export const selectFilesError = (state) => state.files.error;
export const selectUploadProgress = (state) => state.files.uploadProgress;
