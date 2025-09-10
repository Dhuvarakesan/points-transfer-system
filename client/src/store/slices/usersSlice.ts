import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { addPoints, createUser as createUserAPI, deleteUser as deleteUserAPI, editUser, getUserPoints, listUsers } from '../../api';

interface User {
  _id: string; // Make _id mandatory
  name: string;
  email: string;
  password:string;

  role: 'admin' | 'user';
  nox_balance: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface UsersState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  currentPage: number;
  totalUsers: number;
  lastPolledBalance?: number | null;
  showBalanceAnimation?: boolean;
  balanceChangeType?: 'credit' | 'debit';
  balanceChangeAmount?: number | undefined;
}

const initialState: UsersState = {
  users: [ ],
  isLoading: false,
  error: null,
  searchTerm: '',
  currentPage: 1,
  totalUsers: 4,
  lastPolledBalance: null,
  showBalanceAnimation: false,
  balanceChangeType: undefined,
  balanceChangeAmount: undefined,
};
     


export const fetchUserPoints = createAsyncThunk(
  'users/fetchUserPoints',
  async (userId: string) => {
    const response = await getUserPoints(userId);
    return response.data.nox_balance;
  }
);
export const fetchUsers = createAsyncThunk('users/fetchUsers', async (params: { page?: number; search?: string } = {}) => {
  const response = await listUsers(params);
  return response.data;
});

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData: Omit<User, '_id' | 'createdAt'>, { rejectWithValue }) => {
  try {
      const response = await createUserAPI(userData);
      return response.data;
    } catch (err) {
      if (err instanceof AxiosError && err.response && err.response.data) {
        return rejectWithValue(err.response.data);
      }
      return rejectWithValue({ success: false, message: 'Failed to create user' });
    }
  }
);
export const addPointsToUser = createAsyncThunk(
  'users/addPoints',
  async ({ userId, points }: { userId: string; points: number }) => {
    const response = await addPoints({ userId, points });
    return response.data.data;
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ _id, ...updates }: Partial<User> & { _id: string ,},{ rejectWithValue }) => {
    try{
    const response = await editUser(_id, updates);
    return { _id, updates: response.data.data };
    }catch(error){
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId: string,  { rejectWithValue }) => {
    try{
    const response = await deleteUserAPI(userId);
    return response.data;
    }catch(error){
      return rejectWithValue(error);
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.currentPage = 1;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    updateUserPoints: (state, action: PayloadAction<{ userId: string; nox_balance: number }>) => {
  const user = state.users.find(u => u._id === action.payload.userId);
      if (user) {
        user.nox_balance = action.payload.nox_balance;
      }
    },
    resetAnimation: (state) => {
      state.showBalanceAnimation = false;
      state.balanceChangeType = undefined;
      state.balanceChangeAmount = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserPoints.fulfilled, (state, action) => {
        const newBalance = action.payload;
        const prevBalance = state.lastPolledBalance;

        if (prevBalance !== null && newBalance !== prevBalance) {
          const isCredit = newBalance > prevBalance;
          const changeAmount = Math.abs(newBalance - prevBalance);

          state.showBalanceAnimation = true;
          state.balanceChangeType = isCredit ? 'credit' : 'debit';
          state.balanceChangeAmount = changeAmount;
        } else {

            state.showBalanceAnimation = false;
            state.balanceChangeType = undefined;
            state.balanceChangeAmount = undefined;

          
        }
        state.lastPolledBalance = newBalance;
      })

      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.data;
        state.totalUsers = action.payload.data.length;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      .addCase(createUser.fulfilled, (state, action) => {
        if (action.payload.success) {
          const existingUser = state.users.find(user => user._id === action.payload.data._id);
          if (!existingUser) {
            state.users.push(action.payload.data);
            state.totalUsers += 1;
          }
        }
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = { ...state.users[index], ...action.payload.updates };
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.users = state.users.filter(u => u._id !== action.payload.data._id);
          state.totalUsers -= 1;
        }
      })
      .addCase(addPointsToUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addPointsToUser.fulfilled, (state, action) => {
        const { _id, nox_balance } = action.payload;
        const user = state.users.find(u => u._id === _id);
        if (user) {
          user.nox_balance = nox_balance;
        }
        state.isLoading = false;
      })
      .addCase(addPointsToUser.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { setSearchTerm, setCurrentPage, updateUserPoints, resetAnimation } = usersSlice.actions;
export default usersSlice.reducer;

