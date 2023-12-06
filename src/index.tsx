import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import {
  createRoutesFromElements,
  createBrowserRouter, RouterProvider
} from 'react-router-dom'
import getRouting from './routing/routing'
import { Provider } from 'react-redux'
import store from './redux/store'

const router = createBrowserRouter(createRoutesFromElements(getRouting()))

ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
)
