import { Alert, Snackbar } from '@mui/material'
import Box from '@mui/material/Box'
import {
  DataGrid,
  gridClasses,
  type GridEventListener,
  type GridRowModel,
  type GridRowModesModel,
  plPL
} from '@mui/x-data-grid'
import * as React from 'react'
import { useEffect } from 'react'

import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  clearConnectionError,
  reset,
  selectIsConnectionError, selectIsLoading, selectRowModesModel,
  selectRows,
  setNewRowModesModel, updateRow, validatePowerStationByIpv6
} from '../../redux/slices/powerStationsCreatorSlice'
import { PowerStationCreationStatus } from '../common/types'
import UnsavedChangesPrompt from '../common/UnsavedChangesPrompt'
import getColumns from './ColumnsDefinition'
import PowerStationsCreatorFooter from './PowerStationsCreatorFooter'
import PowerStationsCreatorToolbar from './PowerStationsCreatorToolbar'

const PowerStationsCreator: React.FC = () => {
  const dispatch = useAppDispatch()
  const rows = useAppSelector(selectRows)
  const rowModesModel = useAppSelector(selectRowModesModel)
  const isLoading = useAppSelector(selectIsLoading)
  const isConnectionError = useAppSelector(selectIsConnectionError)

  useEffect(() => {
    return () => {
      dispatch(reset())
    }
  }, [])

  const handleRowEditStart: GridEventListener<'rowEditStart'> = (params, event) => {
    event.defaultMuiPrevented = true
  }
  const handleRowEditStop: GridEventListener<'rowEditStop'> = (_params, event) => {
    event.defaultMuiPrevented = true
  }

  const handleProcessRowUpdate = (newRow: GridRowModel): GridRowModel => {
    const loadingRow = { ...newRow, isNew: false, status: PowerStationCreationStatus.Loading, type: undefined }
    dispatch(updateRow(loadingRow))
    void dispatch(validatePowerStationByIpv6({ ipv6: newRow.ipv6, id: newRow.id }))
    return loadingRow
  }

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel): void => {
    dispatch(setNewRowModesModel(newRowModesModel))
  }

  const handleErrorAlertClose = (_event?: React.SyntheticEvent | Event, reason?: string): void => {
    if (reason === 'clickaway') {
      return
    }
    dispatch(clearConnectionError())
  }

  return (
    <>
      <Snackbar
        open={isConnectionError}
        onClose={handleErrorAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleErrorAlertClose} severity="error" sx={{ width: '100%' }}>
          Nie udało się podłączyć niektórych elektrowni
        </Alert>
      </Snackbar>
      <UnsavedChangesPrompt hasUnsavedChanges={rows.length !== 0} />
      <Box sx={{ width: '100%', minHeight: 0, flex: 1, display: 'flex', flexFlow: 'column', typography: 'body1' }}>
        <DataGrid
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          onRowEditStart={handleRowEditStart}
          processRowUpdate={handleProcessRowUpdate}
          loading={isLoading}
          onProcessRowUpdateError={(error) => { console.log(error) }}
          slots={{
            toolbar: PowerStationsCreatorToolbar,
            footer: PowerStationsCreatorFooter
          }}
          disableColumnMenu
          disableColumnSelector
          disableRowSelectionOnClick
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

export default PowerStationsCreator
