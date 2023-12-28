import React, { type JSX } from 'react'
import { Navigate, Route } from 'react-router-dom'
import AppContainer from '../components/AppCointainer/AppContainer'
import PowerProduction from '../components/PowerProduction/PowerProduction'
import AdminPanel from '../components/AdminPanel/AdminPanel'
import PowerStations from '../components/PowerStations/PowerStations'
import PowerProductionPrediction from '../components/PowerProductionPrediction/PowerProductionPrediction'
import PowerStationsCreator from '../components/PowerStationsCreator/PowerStationsCreator'
import PowerStationDetails from '../components/PowerStationDetails/PowerStationDetails'
import powerStationDetailsLoader from './powerStationDetailsLoader'

const getRouting: () => JSX.Element = () =>
  <Route path="/" element={<AppContainer />}>
    <Route path="/" element={<Navigate replace to="/power-production" />} />
    <Route path="/*" element={<Navigate replace to="/power-production" />} />
    <Route path="/power-production" element={<PowerProduction />} />
    <Route path="/power-stations" element={<PowerStations />} />
    <Route path="/power-stations/:id" element={<PowerStationDetails />} loader={powerStationDetailsLoader} />
    <Route path="/power-stations/new" element={<PowerStationsCreator />} />
    <Route path="/power-prediction" element={<PowerProductionPrediction />} />
    <Route path="/admin" element={<AdminPanel />} />
  </Route>

export default getRouting
