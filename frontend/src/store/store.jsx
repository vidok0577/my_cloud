import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

const rootReducer = combineReducers({});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export default store;
