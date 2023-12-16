import * as React from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import {
  DataGrid,
  type GridRowModesModel,
  type GridRowModel,
  type GridEventListener,
  gridClasses,
  plPL
} from '@mui/x-data-grid'
import {
  reset,
  PowerStationStatus, selectIsLoading, selectRowModesModel,
  selectRows,
  setNewRowModesModel, updateRow, validatePowerStationByIpv6
} from '../../redux/slices/powerStationsCreatorSlice'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import PowerStationsCreatorToolbar from './PowerStationsCreatorToolbar'
import getColumns from './ColumnsDefinition'
import PowerStationsCreatorFooter from './PowerStationsCreatorFooter'
import { useEffect } from 'react'
import UnsavedChangesPrompt from '../../routing/UnsavedChangesPrompt'

const PowerStationsCreator: React.FC = () => {
  const dispatch = useAppDispatch()
  const rows = useAppSelector(selectRows)
  const rowModesModel = useAppSelector(selectRowModesModel)
  const isLoading = useAppSelector(selectIsLoading)

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
    const loadingRow = { ...newRow, isNew: false, status: PowerStationStatus.Loading, type: undefined }
    dispatch(updateRow(loadingRow))
    void dispatch(validatePowerStationByIpv6({ ipv6: newRow.ipv6, id: newRow.id }))
    return loadingRow
  }

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel): void => {
    dispatch(setNewRowModesModel(newRowModesModel))
  }

  return (
    <>
      <UnsavedChangesPrompt hasUnsavedChanges={rows.length !== 0}/>
      <Typography variant='h4' mb={1}>
        Nowe elektrownie
      </Typography>
      <Box sx={{
        width: '100%', minHeight: 0, flex: 1, display: 'flex', flexFlow: 'column', typography: 'body1', mt: 3
      }}>
        <DataGrid
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          onRowEditStart={handleRowEditStart}
          processRowUpdate={handleProcessRowUpdate}
          loading={isLoading}
          onProcessRowUpdateError={(error) => {
            // TODO
            console.log(error)
          }}
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
