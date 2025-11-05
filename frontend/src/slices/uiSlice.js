import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarShow: true,
    theme: 'light',
  },
  reducers: {
    // matches your old "set" action
    set: (state, action) => {
      console.log({ ...state, ...action.payload })
      return { ...state, ...action.payload }
    },
  },
})

export const { set } = uiSlice.actions
export default uiSlice.reducer
