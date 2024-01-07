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
import ipaddr from 'ipaddr.js'
import * as React from 'react'
import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  fetchPowerStations,
  reset,
  selectAllRowsCount,
  selectIsLoading,
  selectRows
} from '../../redux/slices/powerStationsSlice'
import PowerStationAlerts from '../common/PowerStationAlerts'
import { PowerStationState, powerStationStateToString, PowerStationType, powerStationTypeToString } from '../common/types'
import getColumns from './ColumnsDefinition'
import PowerStationDisconnectConfirmDialog from './PowerStationDisconnectConfirmDialog'
import PowerStationsToolbar from './PowerStationsToolbar'

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
      if (value.length >= 3 && powerStationStateToString(PowerStationState.Working).startsWith(value)) {
        statePatterns.add(PowerStationState.Working)
      } else if (value.length >= 3 && powerStationStateToString(PowerStationState.Stopped).startsWith(value)) {
        statePatterns.add(PowerStationState.Stopped)
      } else if (value.length >= 3 && powerStationStateToString(PowerStationState.Damaged).startsWith(value)) {
        statePatterns.add(PowerStationState.Damaged)
      } else if (value.length >= 3 && powerStationStateToString(PowerStationState.Maintenance).startsWith(value)) {
        statePatterns.add(PowerStationState.Maintenance)
      } else if (value.length >= 3 && (powerStationTypeToString(PowerStationType.SolarPanel).startsWith(value) || 'sloneczna'.startsWith(value))) {
        typePatterns.add(PowerStationType.SolarPanel)
      } else if (value.length >= 3 && powerStationTypeToString(PowerStationType.WindTurbine).startsWith(value)) {
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

  return (
    <>
      <PowerStationDisconnectConfirmDialog afterConfirm={updateDataGrid} />
      <PowerStationAlerts />
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
