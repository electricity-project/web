import './index.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import {
  createBrowserRouter, createRoutesFromElements,
  RouterProvider
} from 'react-router-dom'

import store from './redux/store'
import getRouting from './routing/routing'

const router = createBrowserRouter(createRoutesFromElements(getRouting()))

ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
)
