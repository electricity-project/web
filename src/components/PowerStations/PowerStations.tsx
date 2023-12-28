import * as React from 'react'
import Box from '@mui/material/Box'
import {
  DataGrid,
  gridClasses,
  plPL, useGridApiRef, gridSortModelSelector, gridPaginationModelSelector
} from '@mui/x-data-grid'
import { useEffect, useRef } from 'react'
import getColumns from './ColumnsDefinition'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  fetchPowerStations,
  reset,
  selectAllRowsCount,
  selectIsLoading,
  selectRows
} from '../../redux/slices/powerStationsSlice'
import PowerStationsToolbar from './PowerStationsToolbar'
import PowerStationDisconnectConfirmDialog from './PowerStationDisconnectConfirmDialog'
import { useNavigate, useLocation } from 'react-router-dom'

const UPDATE_INTERVAL = 60000 // 1 minute

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

  const updateDataGrid = (): void => {
    const paginationModel = gridPaginationModelSelector(dataGridApiRef)
    const sortModel = gridSortModelSelector(dataGridApiRef)
    void dispatch(fetchPowerStations({ ...paginationModel, ...sortModel[0] }))
    restartTimer()
  }

  return (
    <>
      <PowerStationDisconnectConfirmDialog afterConfirm={updateDataGrid} />
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
          rowCount={allRowsCount}
          onPaginationModelChange={updateDataGrid}
          onSortModelChange={updateDataGrid}
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
