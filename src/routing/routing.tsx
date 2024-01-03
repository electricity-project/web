import React, { type JSX } from 'react'
import { Navigate, Route } from 'react-router-dom'

import AdminPanel from '../components/AdminPanel/AdminPanel'
import AppContainer from '../components/AppCointainer/AppContainer'
import LoginPanel from '../components/LoginPanel/LoginPanel'
import PowerProduction from '../components/PowerProduction/PowerProduction'
import PowerProductionPrediction from '../components/PowerProductionPrediction/PowerProductionPrediction'
import PowerStationDetails from '../components/PowerStationDetails/PowerStationDetails'
import PowerStations from '../components/PowerStations/PowerStations'
import PowerStationsCreator from '../components/PowerStationsCreator/PowerStationsCreator'
import ProtectedRoute from './ProtectedRoute'

const getRouting: () => JSX.Element = () =>
  <>
    <Route path="/login" element={<LoginPanel/>}/>
    <Route path="/" element={<ProtectedRoute/>}>
      <Route path="/" element={<AppContainer/>}>
        <Route path="/" element={<Navigate replace to="/power-production"/>}/>
        <Route path="/*" element={<Navigate replace to="/power-production"/>}/>
        <Route index path="/power-production" element={<PowerProduction/>}/>
        <Route path="/power-stations" element={<PowerStations/>}/>
        <Route path="/power-stations/:id" element={<PowerStationDetails/>}/>
        <Route path="/power-stations/new" element={<PowerStationsCreator/>}/>
        <Route path="/power-prediction" element={<PowerProductionPrediction/>}/>
        <Route path="/admin" element={<AdminPanel/>}/>
      </Route>
    </Route>
  </>

export default getRouting
