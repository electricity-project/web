import * as React from 'react'
import Box from '@mui/material/Box'
import {
  DataGrid,
  gridClasses,
  gridPaginationModelSelector,
  gridSortModelSelector,
  plPL, useGridApiRef
} from '@mui/x-data-grid'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import AdminPanelToolbar from './AdminPanelToolbar'
import {
  fetchUsers,
  fetchWeatherApiKey, reset,
  selectAllRowsCount,
  selectIsLoading,
  selectRows
} from '../../redux/slices/adminPanelSlice'
import getColumns from './ColumnsDefinition'
import AdminPanelAlerts from './AdminPanelAlerts'
import DeleteUserConfirmDialog from './DeleteUserConfirmDialog'
import WeatherApiKey from './WeatherApiKey'
import { useEffect } from 'react'

const AdminPanel: React.FC = () => {
  const dispatch = useAppDispatch()
  const dataGridApiRef = useGridApiRef()
  const rows = useAppSelector(selectRows)
  const allRowsCount = useAppSelector(selectAllRowsCount)
  const isLoading = useAppSelector(selectIsLoading)

  useEffect(() => {
    void dispatch(fetchWeatherApiKey())
    return () => {
      dispatch(reset())
    }
  }, [])

  const updateDataGrid = (): void => {
    const paginationModel = gridPaginationModelSelector(dataGridApiRef)
    const sortModel = gridSortModelSelector(dataGridApiRef)

    void dispatch(fetchUsers({ ...paginationModel, ...sortModel[0] }))
  }

  return (
    <>
      <DeleteUserConfirmDialog afterConfirm={updateDataGrid} />
      <AdminPanelAlerts />
      <WeatherApiKey />
      <Box sx={{ width: '100%', minHeight: 0, flex: 1, display: 'flex', flexFlow: 'column', typography: 'body1' }}>
        <DataGrid
          apiRef={dataGridApiRef}
          slots={{
            toolbar: AdminPanelToolbar
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

export default AdminPanel
