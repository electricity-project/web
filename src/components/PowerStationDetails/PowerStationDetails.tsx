import * as React from 'react'
import { useLoaderData } from 'react-router-dom'

const PowerStationDetails: React.FC = () => {
  const { id, type } = (useLoaderData() as any)
  return (
    <div>{`Power Station Details: ${id}, ${type}`}</div>
  )
}

export default PowerStationDetails
