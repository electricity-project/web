import * as React from 'react'
import { type JSX, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  fetchLast48HoursPowerProduction,
  fetchLast60DaysPowerProduction,
  fetchLast60MinutesPowerProduction,
  fetchPowerStationDetails,
  reset,
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
import { PowerStationState, powerStationStateToString } from '../common/types'
import { CustomAxisContentWithTime } from '../common/PowerProductionCharts/CustomAxisContent'
import PowerStationSpecificationTable from './PowerStationSpecificationTable'
import PowerStationDisconnectConfirmDialog from './PowerStationDisconnectConfirmDialog'
import PowerStationAlerts from '../common/PowerStationAlerts'

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
    const fetchData = (id: string): void => {
      void dispatch(fetchPowerStationDetails(id)).then((result) => {
        if (result.type === fetchPowerStationDetails.fulfilled.type) {
          void dispatch(fetchLast60MinutesPowerProduction(result.payload.ipv6))
          void dispatch(fetchLast48HoursPowerProduction(result.payload.ipv6))
          void dispatch(fetchLast60DaysPowerProduction(result.payload.ipv6))
        }
      }).catch(() => {})
    }

    if (id !== undefined) {
      fetchData(id)
      const interval = setInterval(() => {
        fetchData(id)
      }, UPDATE_INTERVAL)
      return () => {
        dispatch(reset())
        clearInterval(interval)
      }
    }
  }, [])

  const createStateChart: () => JSX.Element = () => {
    const tickNumber = 60
    const tickLabelInterval = (time: { getMinutes: () => number }): boolean => time.getMinutes() % 5 === 0
    const valueFormatter = (value: any): string => {
      switch (value) {
        case 4:
          return powerStationStateToString(PowerStationState.Working, true)
        case 3:
          return powerStationStateToString(PowerStationState.Stopped, true)
        case 2:
          return powerStationStateToString(PowerStationState.Damaged, true)
        case 1:
          return powerStationStateToString(PowerStationState.Maintenance, true)
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
            tickMinStep: 1,
            max: 4.6,
            min: 0,
            tickNumber: 4,
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

  if (isLoadingDetails || powerStationDetails === undefined) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minWidth: 0 }}>
        <CircularProgress size={70} />
      </Box>
    )
  }

  return (
    <>
      <PowerStationDisconnectConfirmDialog />
      <PowerStationAlerts />
      <PowerStationSpecificationTable powerStationDetails={powerStationDetails}/>
      <PowerProductionCharts
        dataKey={'power'}
        last60MinutesDataset={last60MinutesDataset}
        last48HoursDataset={last48HoursDataset}
        last60DaysDataset={last60DaysDataset}/>
      <Box sx={{ width: '100%', minWidth: '700px', minHeight: '300px', flex: 1, padding: 0, border: 1, borderTop: 0, borderColor: 'divider' }}>
        {createStateChart()}
      </Box>
    </>
  )
}

export default PowerStationDetails
