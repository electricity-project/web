import * as React from 'react'
import { useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import {
  DataGrid,
  gridClasses,
  gridPaginationModelSelector,
  gridQuickFilterValuesSelector,
  gridSortModelSelector,
  plPL,
  useGridApiRef
} from '@mui/x-data-grid'
import getColumns from './ColumnsDefinition'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  clearAlert,
  clearAlertProps,
  fetchPowerStations,
  reset,
  selectAlertProps,
  selectAlertsQueue,
  selectAllRowsCount,
  selectIsAlertVisible,
  selectIsLoading,
  selectRows,
  updateAlert
} from '../../redux/slices/powerStationsSlice'
import PowerStationsToolbar from './PowerStationsToolbar'
import PowerStationDisconnectConfirmDialog from './PowerStationDisconnectConfirmDialog'
import { useLocation, useNavigate } from 'react-router-dom'
import ipaddr from 'ipaddr.js'
import { Alert, Snackbar } from '@mui/material'
import { PowerStationState, PowerStationType } from '../common/types'

// eslint-disable-next-line
const UPDATE_INTERVAL = Number(process.env.REACT_APP_API_UPDATE_INTERVAL || 60000) // 1 minute

const PowerStations: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const dataGridApiRef = useGridApiRef()
  const rows = useAppSelector(selectRows)
  const allRowsCount = useAppSelector(selectAllRowsCount)
  const isLoading = useAppSelector(selectIsLoading)
  const isAlertVisible = useAppSelector(selectIsAlertVisible)
  const alertProps = useAppSelector(selectAlertProps)
  const alertsQueue = useAppSelector(selectAlertsQueue)
  const intervalIDRef = useRef<NodeJS.Timer | null>(null)

  useEffect(() => {
    navigate(location.pathname, { replace: true })
    restartTimer()
    return () => {
      dispatch(reset())
      if (intervalIDRef.current !== null) {
        clearInterval(intervalIDRef.current)
      }
    }
  }, [])

  const restartTimer = React.useCallback(() => {
    if (intervalIDRef.current !== null) {
      clearInterval(intervalIDRef.current)
    }
    intervalIDRef.current = setInterval(() => {
      updateDataGrid()
    }, UPDATE_INTERVAL)
  }, [])

  useEffect(() => {
    if (alertsQueue.length > 0 && alertProps === undefined) {
      dispatch(updateAlert())
    } else if (alertsQueue.length > 0 && alertProps !== undefined && isAlertVisible) {
      dispatch(clearAlert())
    }
  }, [alertsQueue, alertProps, isAlertVisible])

  const setPatterns = (
    quickFilterValues: any[] | undefined,
    ipv6Patterns: Set<string>,
    statePatterns: Set<PowerStationState>,
    typePatterns: Set<PowerStationType>
  ): void => {
    quickFilterValues = quickFilterValues === undefined || quickFilterValues.length === 0
      ? []
      : Array.from(new Set(quickFilterValues.join(' ').split(',').map((value) => value.trim().toLowerCase())))

    quickFilterValues.forEach((value) => {
      if (value.length >= 3 && 'uruchomiona'.startsWith(value)) {
        statePatterns.add(PowerStationState.Working)
      } else if (value.length >= 3 && 'zatrzymana'.startsWith(value)) {
        statePatterns.add(PowerStationState.Stopped)
      } else if (value.length >= 3 && 'uszkodzona'.startsWith(value)) {
        statePatterns.add(PowerStationState.Damaged)
      } else if (value.length >= 3 && 'w naprawie'.startsWith(value)) {
        statePatterns.add(PowerStationState.Maintenance)
      } else if (value.length >= 3 && ('słoneczna'.startsWith(value) || 'sloneczna'.startsWith(value))) {
        typePatterns.add(PowerStationType.SolarPanel)
      } else if (value.length >= 3 && 'wiatrowa'.startsWith(value)) {
        typePatterns.add(PowerStationType.WindTurbine)
      } else {
        if (ipaddr.isValid(value)) {
          ipv6Patterns.add(ipaddr.parse(value).toString())
        } else {
          ipv6Patterns.add(value)
        }
      }
    })
  }

  const updateDataGrid = (): void => {
    const paginationModel = gridPaginationModelSelector(dataGridApiRef)
    const sortModel = gridSortModelSelector(dataGridApiRef)
    const quickFilterValues = gridQuickFilterValuesSelector(dataGridApiRef)
    const ipv6Patterns = new Set<string>()
    const statePatterns = new Set<PowerStationState>()
    const typePatterns = new Set<PowerStationType>()
    setPatterns(quickFilterValues, ipv6Patterns, statePatterns, typePatterns)

    void dispatch(fetchPowerStations({ ...paginationModel, ...sortModel[0], ipv6Patterns, statePatterns, typePatterns }))
    restartTimer()
  }

  const handleAlertClose = (_event?: React.SyntheticEvent | Event, reason?: string): void => {
    if (reason === 'clickaway') {
      return
    }
    dispatch(clearAlert())
  }

  const handleAlertTransitionExited = (): void => {
    dispatch(clearAlertProps())
  }

  return (
    <>
      <PowerStationDisconnectConfirmDialog afterConfirm={updateDataGrid} />
      <Snackbar
        key={alertProps?.key}
        open={isAlertVisible}
        autoHideDuration={5000}
        style={{ zIndex: 1299 }}
        onClose={handleAlertClose}
        TransitionProps={{ onExited: handleAlertTransitionExited }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleAlertClose} severity={alertProps?.severity} sx={{ width: '100%' }}>
          {alertProps?.message}
        </Alert>
      </Snackbar>
      <Box sx={{ width: '100%', minHeight: 0, flex: 1, display: 'flex', flexFlow: 'column', typography: 'body1' }}>
        <DataGrid
          apiRef={dataGridApiRef}
          slots={{
            toolbar: PowerStationsToolbar
          }}
          loading={isLoading}
          disableColumnMenu
          disableColumnSelector
          disableRowSelectionOnClick
          autoPageSize
          paginationMode='server'
          onPaginationModelChange={updateDataGrid}
          rowCount={allRowsCount}
          sortingMode='server'
          onSortModelChange={updateDataGrid}
          filterMode='server'
          onFilterModelChange={updateDataGrid}
          columns={getColumns(updateDataGrid)}
          rows={rows}
          sx={{
            [`& .${gridClasses.cell}:focus, & .${gridClasses.cell}:focus-within`]: {
              outline: 'none'
            },
            [`& .${gridClasses.columnHeader}:focus, & .${gridClasses.columnHeader}:focus-within`]: {
              outline: 'none'
            },
            minHeight: '300px',
            minWidth: '700px'
          }}
          localeText={plPL.components.MuiDataGrid.defaultProps.localeText}
        />
      </Box>
    </>
  )
}

export default PowerStations
