import { configureStore } from '@reduxjs/toolkit'
// import authSlice from './slices/auth'
import uiSlice from "./slices/uiSlice"
// import user from "./slices/tenant/user"

const store = configureStore({
  reducer: {
    // auth: authSlice,
    ui: uiSlice, 
    // user : user
  },
})
export default store 


/*



*/