import { getConfig } from '@/lib/config';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';



interface User {
  _id: string;
  name: string;
  email: string;
  password:string;
  role: 'admin' | 'user';
  nox_balance: number;
  status: 'active' | 'inactive';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      console.log("password:",password)
      const response = await axios.post(`${getConfig().serverBaseUrl}/authenticate`, { email, password });
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('userId', response.data.data.user._id);
      localStorage.setItem('userName', response.data.data.user.name);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      return response.data.data; // Assuming the API returns { user, token }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      return rejectWithValue(axiosError.response?.data?.message || 'Login failed');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  // logger.info('User logout');
  localStorage.removeItem('accessToken')
  localStorage.removeItem('root')
  localStorage.clear(); // Clear all data in local storage

});

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (refreshToken: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(getConfig().serverBaseUrl + '/refresh-token', { refreshToken: refreshToken });
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      return {
        accessToken: response.data.accessToken,
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      return rejectWithValue(axiosError.response?.data?.message || 'Token refresh failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUserPoints: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.nox_balance = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, updateUserPoints } = authSlice.actions;
export default authSlice.reducer;