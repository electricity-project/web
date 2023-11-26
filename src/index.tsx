import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import {
  createRoutesFromElements,
  createBrowserRouter, RouterProvider
} from 'react-router-dom'
import getRouting from './Routing/routing'

const router = createBrowserRouter(createRoutesFromElements(getRouting()))

ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
).render(
  <RouterProvider router={router} />
)
