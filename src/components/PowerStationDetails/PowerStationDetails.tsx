import * as React from 'react'
import { useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { type JSX, useEffect } from 'react'
import {
  fetchLast48HoursPowerProduction,
  fetchLast60DaysPowerProduction,
  fetchLast60MinutesPowerProduction,
  fetchPowerStationDetails,
  selectDetails,
  selectIsDetailsError,
  selectIsLoadingDetails,
  selectLast48HoursDataset,
  selectLast60DaysDataset,
  selectLast60MinutesDataset
} from '../../redux/slices/powerStationDetailsSlice'
import PowerProductionCharts from '../common/PowerProductionCharts/PowerProductionCharts'
import { CircularProgress } from '@mui/material'
import Box from '@mui/material/Box'
import PowerStationErrorPage from './PowerStationErrorPage'
import { LineChart } from '@mui/x-charts'
import { PowerStationState } from '../common/types'
import { CustomAxisContentWithTime } from '../common/PowerProductionCharts/CustomAxisContent'

// eslint-disable-next-line
const UPDATE_INTERVAL = Number(process.env.REACT_APP_API_UPDATE_INTERVAL || 60000) // 1 minute

const PowerStationDetails: React.FC = () => {
  const dispatch = useAppDispatch()
  const { id } = useParams()
  const isLoadingDetails = useAppSelector(selectIsLoadingDetails)
  const isDetailsError = useAppSelector(selectIsDetailsError)
  const powerStationDetails = useAppSelector(selectDetails)
  const last60MinutesDataset = useAppSelector(selectLast60MinutesDataset)
  const last48HoursDataset = useAppSelector(selectLast48HoursDataset)
  const last60DaysDataset = useAppSelector(selectLast60DaysDataset)

  useEffect(() => {
    if (id !== undefined) {
      void dispatch(fetchPowerStationDetails(id))
      const interval = setInterval(() => {
        void dispatch(fetchPowerStationDetails(id))
      }, UPDATE_INTERVAL)
      return () => {
        clearInterval(interval)
      }
    }
  }, [])

  useEffect(() => {
    if (powerStationDetails !== undefined) {
      void dispatch(fetchLast60MinutesPowerProduction(powerStationDetails.ipv6))
      void dispatch(fetchLast48HoursPowerProduction(powerStationDetails.ipv6))
      void dispatch(fetchLast60DaysPowerProduction(powerStationDetails.ipv6))
      const interval = setInterval(() => {
        void dispatch(fetchLast60MinutesPowerProduction(powerStationDetails.ipv6))
        void dispatch(fetchLast48HoursPowerProduction(powerStationDetails.ipv6))
        void dispatch(fetchLast60DaysPowerProduction(powerStationDetails.ipv6))
      }, UPDATE_INTERVAL)
      return () => {
        clearInterval(interval)
      }
    }
  }, [powerStationDetails])

  const getStateChart: () => JSX.Element = () => {
    const tickNumber = 60
    const tickLabelInterval = (time: { getMinutes: () => number }): boolean => time.getMinutes() % 5 === 0
    const valueFormatter = (value: any): string => {
      switch (value) {
        case 4:
          return 'Uruchomiona'
        case 3:
          return 'Zatrzymana'
        case 2:
          return 'Uszkodzona'
        case 1:
          return 'W naprawie'
        default:
          return ''
      }
    }

    return (
      <LineChart
        slots={{
          axisContent: CustomAxisContentWithTime
        }}
        xAxis={[
          {
            dataKey: 'timestamp',
            scaleType: 'time',
            tickNumber,
            tickLabelInterval,
            valueFormatter: (value: Date): string => {
              return value.toLocaleString('pl-PL', { hour: '2-digit', minute: '2-digit', hour12: false })
            }
          }
        ]}
        yAxis={[
          {
            max: 5,
            min: 0,
            tickNumber: 6,
            valueFormatter
          }
        ]}
        margin={{ left: 90 }}
        series={[
          {
            dataKey: 'state',
            curve: 'step',
            label: 'Status elektrowni',
            color: 'orange',
            valueFormatter
          }
        ]}
        dataset={last60MinutesDataset.map((element) => {
          let newState
          switch (element.state) {
            case PowerStationState.Working:
              newState = 4
              break
            case PowerStationState.Stopped:
              newState = 3
              break
            case PowerStationState.Damaged:
              newState = 2
              break
            case PowerStationState.Maintenance:
              newState = 1
              break
          }
          return { ...element, state: newState }
        }) as Array<{ timestamp: Date, state: number }>}
      />
    )
  }

  if (isDetailsError) {
    return (
      <PowerStationErrorPage />
    )
  }

  if (isLoadingDetails && powerStationDetails === undefined) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minWidth: 0 }}>
        <CircularProgress size={70} />
      </Box>
    )
  }

  return (
    <>
      <div>{`Power Station Details: ${id}, ${powerStationDetails?.type}`}</div>
      <PowerProductionCharts
        dataKey={'power'}
        last60MinutesDataset={last60MinutesDataset}
        last48HoursDataset={last48HoursDataset}
        last60DaysDataset={last60DaysDataset} />
      <Box sx={{ width: '100%', minWidth: '700px', minHeight: '200px', flex: 1, padding: 0, border: 1, borderTop: 0, borderColor: 'divider' }}>
        {getStateChart()}
      </Box>
    </>
  )
}

export default PowerStationDetails
