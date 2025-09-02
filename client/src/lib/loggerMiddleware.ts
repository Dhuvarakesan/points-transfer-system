import { Middleware } from '@reduxjs/toolkit';
import { logger } from './logger';

export const loggerMiddleware: Middleware = (store) => (next) => (action: any) => {
  // Log Redux actions (excluding persist actions to avoid spam)
  if (action.type && !action.type.startsWith('persist/') && !action.type.startsWith('@@')) {
    const state = store.getState();
    const userEmail = state?.auth?.user?.email;
    
    // Only log significant actions, not every state change
    if (action.type.includes('fulfilled') || action.type.includes('rejected') || action.type.includes('pending')) {
      logger.debug(`Redux action: ${action.type}`, {
        actionType: action.type,
        userEmail: userEmail || 'anonymous',
        payload: action.type.includes('rejected') ? action.error || action.payload : undefined
      });
    }
  }
  
  return next(action);
};