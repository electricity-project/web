import { HighlightOff, Pause, PlayArrow } from '@mui/icons-material'
import { CircularProgress, IconButton, Paper, Tooltip } from '@mui/material'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import type { JSX } from 'react'
import * as React from 'react'
import { matchPath, useLocation } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  fetchLast48HoursPowerProduction, fetchLast60DaysPowerProduction,
  fetchLast60MinutesPowerProduction,
  fetchPowerStationDetails,
  openDisconnectConfirmDialog,
  selectDetails, selectIsDetailsError, selectIsLoadingDetails
} from '../../redux/slices/powerStationDetailsSlice'
import { selectPendingRows, startPowerStation, stopPowerStation } from '../../redux/slices/powerStationsSlice'
import { PowerStationState, powerStationStateToString } from '../common/types'

const ViewBar: React.FC = () => {
  const dispatch = useAppDispatch()
  const { pathname } = useLocation()
  const powerStationDetails = useAppSelector(selectDetails)
  const pendingRows = useAppSelector(selectPendingRows)
  let viewHeaderText

  switch (pathname) {
    case '/power-stations':
      viewHeaderText = 'Elektrownie'
      break
    case '/power-stations/new':
      viewHeaderText = 'Nowe elektrownie'
      break
    case matchPath('/power-stations/:id', pathname)?.pathname:
      viewHeaderText = 'Szczegóły elektrowni'
      break
    case '/power-prediction':
      viewHeaderText = 'Predykcja produkcji prądu'
      break
    case '/admin':
      viewHeaderText = 'Panel administratora'
      break
    default:
      viewHeaderText = 'Stan produkcji prądu'
      break
  }

  const createButtons = (): JSX.Element | null => {
    const isLoadingDetails = useAppSelector(selectIsLoadingDetails)
    const isDetailsError = useAppSelector(selectIsDetailsError)

    if (matchPath('/power-stations/:id', pathname) === null ||
      powerStationDetails === undefined || isLoadingDetails || isDetailsError) {
      return null
    }

    if (Object.prototype.hasOwnProperty.call(pendingRows, powerStationDetails.id)) {
      return (
        <Paper variant="outlined" sx={{ p: 0.5, alignItems: 'center', justifyContent: 'center', minWidth: 92, minHeight: 52, display: 'flex' }}>
          <CircularProgress size={24} />
        </Paper>
      )
    }

    const createStartStopButton = (): JSX.Element => {
      const fetchDetailsData = (id: number): void => {
        void dispatch(fetchPowerStationDetails(id)).then((result) => {
          if (result.type === fetchPowerStationDetails.fulfilled.type) {
            void dispatch(fetchLast60MinutesPowerProduction(result.payload.ipv6))
            void dispatch(fetchLast48HoursPowerProduction(result.payload.ipv6))
            void dispatch(fetchLast60DaysPowerProduction(result.payload.ipv6))
          }
        }).catch(() => {})
      }

      const onStop = (): void => {
        dispatch(stopPowerStation({ id: powerStationDetails.id, ipv6: powerStationDetails.ipv6 }))
          .then((result) => {
            if (result.type === stopPowerStation.fulfilled.type) {
              fetchDetailsData(powerStationDetails.id)
            }
          }).catch(() => {})
      }

      const onStart = (): void => {
        dispatch(startPowerStation({ id: powerStationDetails.id, ipv6: powerStationDetails.ipv6 }))
          .then((result) => {
            if (result.type === startPowerStation.fulfilled.type) {
              fetchDetailsData(powerStationDetails.id)
            }
          }).catch(() => {})
      }

      if (powerStationDetails?.state === PowerStationState.Working) {
        return (
          <Tooltip
            disableInteractive
            title='Zatrzymaj pracę elektrowni'>
            <IconButton onClick={onStop}>
              <Pause sx={{ fontSize: 25 }} />
            </IconButton>
          </Tooltip>
        )
      }
      const isDisabled = powerStationDetails.state !== PowerStationState.Stopped
      return (
        <Tooltip
          disableInteractive
          title={isDisabled ? `Nie można uruchomić gdy jest ${powerStationStateToString(powerStationDetails.state)}` : 'Uruchom pracę elektrowni'}>
          <span>
            <IconButton disabled={isDisabled} onClick={onStart}>
              <PlayArrow sx={{ fontSize: 25 }} />
            </IconButton>
          </span>
        </Tooltip>
      )
    }

    return (
      <Paper variant="outlined" sx={{ p: 0.5, minWidth: 92, minHeight: 52 }}>
        {createStartStopButton()}
        <Tooltip
          disableInteractive
          title='Odłącz elektrownię od systemu'>
          <IconButton onClick={() => { dispatch(openDisconnectConfirmDialog({ id: powerStationDetails.id, ipv6: powerStationDetails.ipv6 })) }}>
            <HighlightOff color={'error'} sx={{ fontSize: 25 }} />
          </IconButton>
        </Tooltip>
      </Paper>
    )
  }

  return (
    <AppBar
      position="static"
      style={{
        height: 64.2,
        backgroundColor: '#ffffff',
        color: '#000000',
        justifyContent: 'center',
        zIndex: 1097
      }}
    >
      <Toolbar style={{ paddingLeft: 16, paddingRight: 32 }}>
        <Typography variant='h4' sx={{ flexGrow: 1, whiteSpace: 'nowrap' }}>
          {viewHeaderText}
        </Typography>
        {createButtons()}
      </Toolbar>
    </AppBar>
  )
}

export default ViewBar
