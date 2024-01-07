import Box from '@mui/material/Box'
import {
  DataGrid,
  gridClasses,
  gridPaginationModelSelector,
  gridSortModelSelector,
  plPL, useGridApiRef
} from '@mui/x-data-grid'
import * as React from 'react'
import { useEffect } from 'react'

import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  fetchUsers,
  fetchWeatherApiKey, reset,
  selectAllRowsCount,
  selectIsLoading,
  selectRows
} from '../../redux/slices/adminPanelSlice'
import AdminPanelAlerts from './AdminPanelAlerts'
import AdminPanelToolbar from './AdminPanelToolbar'
import getColumns from './ColumnsDefinition'
import CreateUserDialog from './CreateUserDialog'
import DeleteUserConfirmDialog from './DeleteUserConfirmDialog'
import EditUserDialog from './EditUserDialog'
import WeatherApiKey from './WeatherApiKey'

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
      <AdminPanelAlerts />
      <DeleteUserConfirmDialog afterConfirm={updateDataGrid} />
      <CreateUserDialog afterCreateAction={updateDataGrid} />
      <EditUserDialog afterEditAction={updateDataGrid} />
      <WeatherApiKey />
      <Box sx={{ width: '100%', minHeight: 0, flex: 1, display: 'flex', flexFlow: 'column', typography: 'body1' }}>
        <DataGrid
          apiRef={dataGridApiRef}
          slots={{
            toolbar: AdminPanelToolbar
          }}
          initialState={{
            sorting: {
              sortModel: [{ field: 'username', sort: 'asc' }]
            }
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
          columns={getColumns()}
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
