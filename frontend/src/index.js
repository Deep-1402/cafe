import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'

import App from './App'
import store from './store'
import { BrowserRouter } from 'react-router-dom'
import { UIProvider } from './context/ui'

createRoot(document.getElementById('root')).render(
  // <Provider store={store}>
  <UIProvider>
    <BrowserRouter>
     <App />
    </BrowserRouter>
    </UIProvider>
  // </Provider>,
)

