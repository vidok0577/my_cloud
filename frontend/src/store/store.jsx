import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export default configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['files/uploadFile'],
        ignoredPaths: ['files.uploadProgress']
      }
    })
});
