import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../apis/axiosInstance.js'
import { useNavigate } from 'react-router-dom'


const tenantCreation = createAsyncThunk('tenant', async (credentials) => {
  const info = await api
    .post('master/signup', credentials)
    .then((result) => {
      return { status: result.status, data: result.data }
    })
    .catch((error) => {
      // console.log(error, error.response.data.error)
      return { log: error.response.data.error }
    })
  // .catch((error) => (error.data.error, console.log(error)));
  console.log(info)
  return info
})

const login = createAsyncThunk('login', async (credentials) => {
  const info = await api
    .post('tenant/login', credentials)
    .then((result) => {
      return { status: result.status, data: result.data }
    })
    .catch((error) => {
      return { message: error.response.data.message }
      // console.log(error.response.data.log);
      // return { log: error };
    })
  // console.log(info.status, info.status == 200);

  // if(info.status == 200 ){
  //   localStorage.setItem("token", info.data.token)
  // }
  // console.log(info)
  return info
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    message: null,
    permission: [],
    status: null,
  },
  reducers: {
    logout: () => {
      localStorage.removeItem("token");
      // navigate("/login")
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(tenantCreation.fulfilled, (state, action) => {
        // state.message.push(action.payload.log);
        state.message = action.payload.log
      })
      .addCase(login.fulfilled, (state, action) => {
        // if()
        // console.log(info.data.token)
        console.log(action, action.payload.data.data.permissions, action.payload.data)
        if (action.payload.status == 200) {
          localStorage.setItem('token', action.payload.data.data.token)
          state.permission = action.payload.data.data.permissions
        }
        state.message = action.payload.message
        // console.log(action.payload)
        // state.status = action.payload.status
        // console.log("fullfilled");
      })
    // .addCase(login.rejected, (state, action) => {
    //   console.log("Errrrror", action);
    // });
  },
})
export const {logout} = authSlice.actions
export default authSlice.reducer
// apis
export { login, tenantCreation }


/*

*/