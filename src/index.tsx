import './index.css'
import 'moment/locale/pl'

import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { plPL } from '@mui/x-date-pickers/locales'
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
  <LocalizationProvider dateAdapter={AdapterMoment} localeText={plPL.components.MuiLocalizationProvider.defaultProps.localeText}>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </LocalizationProvider>
)
