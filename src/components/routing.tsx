import React, { type JSX } from 'react'
import { Navigate, Route } from 'react-router-dom'
import AppContainer from './AppCointainer/AppContainer'
import PowerProduction from './PowerProduction/PowerProduction'
import AdminPanel from './AdminPanel/AdminPanel'
import PowerStations from './PowerStations/PowerStations'
import PowerProductionPrediction from './PowerProductionPrediction/PowerProductionPrediction'

const getRouting: () => JSX.Element = () =>
  <Route path="/" element={<AppContainer />}>
    <Route path="/" element={<Navigate replace to="/power-production" />}/>
    <Route path="/*" element={<Navigate replace to="/power-production" />}/>
    <Route path="/power-production" element={<PowerProduction />}/>
    <Route path="/power-stations" element={<PowerStations />}/>
    <Route path="/power-prediction" element={<PowerProductionPrediction />}/>
    <Route path="/admin" element={<AdminPanel />}/>
  </Route>

export default getRouting
