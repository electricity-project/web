import * as React from 'react'
import { useLoaderData } from 'react-router-dom'
import { type PowerStationDetailsLoader } from '../../routing/powerStationDetailsLoader'

const PowerStationDetails: React.FC = () => {
  const { id, type } = (useLoaderData() as PowerStationDetailsLoader)
  return (
    <div>{`Power Station Details: ${id}, ${type}`}</div>
  )
}

export default PowerStationDetails
