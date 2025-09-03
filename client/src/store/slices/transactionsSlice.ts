import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getAllTransactions, getUserTransactionHistory, transferPoints as transferPointsAPI } from '../../api';
export const fetchAllTransactions = createAsyncThunk(
  'transactions/fetchAllTransactions',
  async () => {
    const response = await getAllTransactions();
    return response.data.data;
  }
);
export const fetchUserTransactions = createAsyncThunk(
  'transactions/fetchUserTransactions',
  async (id:string) => {
    const response = await getUserTransactionHistory(id);
    return response.data.data;
  }
);

interface Transaction {
  _id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  amount: number;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
}

interface TransactionsState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalTransactions: number;
}

const initialState: TransactionsState = {
  transactions: [
  ],
  isLoading: false,
  error: null,
  currentPage: 1,
  totalTransactions: 3,
};

export const transferPoints = createAsyncThunk(
  'transactions/transferPoints',
  async ({ _id ,receiverId, amount }: { _id:string; receiverId: string; amount: number }) => {
    const response = await transferPointsAPI({ _id, receiverId, amount });
    return response.data;
  }
);

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (id:string) => {
    const response = await getUserTransactionHistory(id);
    return {
      transactions: response.data.data,
      total: response.data.data.length,
    };
  }
);

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(transferPoints.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(transferPoints.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!Array.isArray(state.transactions)) {
          state.transactions = [];
        }
        state.transactions.unshift(action.payload);
        state.totalTransactions += 1;
      })
      .addCase(transferPoints.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Transfer failed';
      })
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.transactions;
        state.totalTransactions = action.payload.total;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch transactions';
      })
      .addCase(fetchAllTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload;
        state.totalTransactions = action.payload.length;
      })
      .addCase(fetchAllTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch transactions';
      })
      .addCase(fetchUserTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload;
        state.totalTransactions = action.payload.length;
      })
      .addCase(fetchUserTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch transactions';
      });
  },
});

export const { setCurrentPage, clearError } = transactionsSlice.actions;
export default transactionsSlice.reducer;