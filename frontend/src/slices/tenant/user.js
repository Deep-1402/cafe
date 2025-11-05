import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../apis/axiosInstance'

// Get all users
const getAll = createAsyncThunk('tenant/getAllUsers', async () => {
  const info = await api
    .get('tenant/user')
    .then((result) => {
        // console.log(result)
      return { status: result.status, data: result.data }
    })
    .catch((error) => {
      return { message: error.response?.data?.message || 'Error fetching users' }
    })
  return info
})

const tenantSlice = createSlice({
  name: 'tenant',
  initialState: {
    message: null,
    users: [],
  },
  reducers: {
    clearMessage: (state) => {
      state.message = null
    },
  },
  extraReducers: (builder) => {
    builder
    //   .addCase(getAll.pending, (state) => {
    //     state.loading = true
    //   })
      .addCase(getAll.fulfilled, (state, action) => {
        // state.loading = false
        // console.log(action)
        if (action.payload.status === 200) {
          state.users = action.payload.data.data
        //   console.log(state.users)
        } else {
          state.message = action.payload.data.message
        }
      })
      .addCase(getAll.rejected, (state, action) => {
        // state.loading = false
        state.message = 'Failed to fetch users'
      })
  },
})

export const { clearMessage } = tenantSlice.actions
export default tenantSlice.reducer

// Export APIs
export { getAll }