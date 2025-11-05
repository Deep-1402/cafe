import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../apis/axiosInstance.js'

// const userSsignup = createAsyncThunk("signup", async (credentials) => {
//   const info = await api
//     .post("signup", credentials)
//     .then((result) => result.data)
//     .catch((error) => {
//       // console.log(error, error.response.data.error)
//       return { log: error.response.data.error };
//     });
//   // .catch((error) => (error.data.error, console.log(error)));
//   console.log(info);
//   return info;
// });

const getAll = createAsyncThunk('getAll', async () => {
  const info = await api
    .get('master/subscription')
    .then((result) => {
      console.log(result)
      return { status: result.status, data: result.data }
    })
    .catch((error) => {
      console.log(error)
      return { log: error.response.data.log }
      // console.log(error.response.data.log);
      // return { log: error };
    })
  // console.log(info.status, info.status == 200);

  // if(info.status == 200 ){
  //   localStorage.setItem("token", info.data.token)
  // }
  console.log(info)
  return info
})

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: {
    message: null,
    status: null,
    plans : []
  },
  reducers: {
    // signup: (state) => {
    //   // state.value += 1;
    // },
  },
  extraReducers: (builder) => {
    builder
      // .addCase(userSsignup.fulfilled, (state, action) => {
      //   // state.message.push(action.payload.log);
      //   state.message = action.payload.log
      // })
      .addCase(getAll.fulfilled, (state, action) => {
        // if()
        // console.log(info.data.token)
        // if (action.payload.status == 200) {
        //   localStorage.setItem('token', action.payload.data.token)
        // }
        state.plans = action.payload.data.plans
        console.log(action, state)

        // state.message = action.payload.log
        // state.status = action.payload.status
        // console.log("fullfilled");
      })
    // .addCase(login.rejected, (state, action) => {
    //   console.log("Errrrror", action);
    // });
  },
})
export const {} = subscriptionSlice.actions
export default subscriptionSlice.reducer
// apis
export { getAll }
