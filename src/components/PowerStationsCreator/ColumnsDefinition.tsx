import {
  GridActionsCellItem,
  type GridColDef,
  type GridColumnHeaderParams,
  type GridRenderCellParams, type GridRowId, GridRowModes, type GridRowParams
} from '@mui/x-data-grid'
import ipaddr from 'ipaddr.js'
import { Chip, CircularProgress, Tooltip } from '@mui/material'
import {
  Autorenew,
  Cancel,
  CheckCircleOutline, Delete,
  Edit,
  ErrorOutline,
  HelpOutline,
  Save,
  SolarPower,
  WindPower
} from '@mui/icons-material'
import * as React from 'react'
import {
  deleteRowById,
  PowerStationStatus,
  PowerStationType, selectRowModesModel, selectRows, setRowMode, validatePowerStationByIpv6
} from '../../redux/slices/powerStationsCreatorSlice'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'

const getColumns = (): GridColDef[] => {
  const dispatch = useAppDispatch()
  const rows = useAppSelector(selectRows)
  const rowModesModel = useAppSelector(selectRowModesModel)
  return [
    {
      field: 'ipv6',
      headerName: 'Adres IPv6',
      description: 'Adres IPv6 elektrowni',
      minWidth: 320,
      width: 350,
      hideable: false,
      editable: true,
      sortable: false,
      valueFormatter: (params) => ipaddr.parse(params.value).toString(),
      renderHeader: (params: GridColumnHeaderParams) => (
        <Tooltip disableInteractive title={params.colDef.description}>
          <strong>{params.colDef.headerName}</strong>
        </Tooltip>
      ),
      renderCell: (params) => (
        <Tooltip disableInteractive title={params.value}>
          {params.formattedValue}
        </Tooltip>
      )
    },
    {
      field: 'type',
      headerName: 'Typ',
      description: 'Typ elektrowni',
      flex: 4,
      minWidth: 150,
      hideable: false,
      sortable: false,
      type: 'singleSelect',
      valueOptions: [PowerStationType.WindTurbine, PowerStationType.SolarPanel],
      renderHeader: (params: GridColumnHeaderParams) => (
        <Tooltip disableInteractive title={params.colDef.description}>
          <strong>{params.colDef.headerName}</strong>
        </Tooltip>
      ),
      renderCell: (params: GridRenderCellParams<any, PowerStationType>) => {
        let icon
        let color
        let title
        let borderColor
        switch (params.value) {
          case PowerStationType.WindTurbine:
            borderColor = color = '#6a86d3'
            icon = <WindPower color='inherit' />
            title = 'Turbina wiatrowa'
            break
          case PowerStationType.SolarPanel:
            borderColor = color = '#e1b907'
            icon = <SolarPower color='inherit' />
            title = 'Panele solarne'
            break
          default:
            color = '#616161'
            borderColor = 'default'
            icon = <HelpOutline sx={{ color }} />
            title = 'Nieznany'
            break
        }
        return (
          <Tooltip disableInteractive title={title} >
            <Chip
              size="medium"
              variant="outlined"
              color={'default'}
              sx={{ color, borderColor }}
              icon={icon}
              label={params.value ?? 'Nieznany'} />
          </Tooltip>
        )
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      description: 'Status elektrowni',
      flex: 4,
      minWidth: 145,
      hideable: false,
      sortable: false,
      type: 'singleSelect',
      valueOptions: [PowerStationStatus.Success, PowerStationStatus.Error, PowerStationStatus.Loading],
      renderHeader: (params: GridColumnHeaderParams) => (
        <Tooltip disableInteractive title={params.colDef.description}>
          <strong>{params.colDef.headerName}</strong>
        </Tooltip>
      ),
      renderCell: (params: GridRenderCellParams<any, PowerStationStatus>) => {
        let icon
        let color
        let label
        let title
        switch (params.value) {
          case PowerStationStatus.Success:
            color = 'success' as const
            icon = <CheckCircleOutline />
            label = 'Gotowa'
            title = 'Elektrownia gotowa do podłączenia'
            break
          case PowerStationStatus.Error:
            color = 'error' as const
            icon = <ErrorOutline />
            label = 'Błąd'
            title = params.row.error
            break
          default:
            color = 'default' as const
            icon = <HelpOutline />
            label = 'Nieznany'
            title = 'Sprawdzanie statusu elektrowni'
            break
        }
        return (
          <Tooltip disableInteractive title={title} >
            <Chip
              size="medium"
              variant="outlined"
              color={color}
              icon={icon}
              label={label} />
          </Tooltip>
        )
      }
    },
    {
      field: 'actions',
      headerName: 'Akcje',
      description: 'Możliwe do wykonania akcje',
      flex: 4,
      minWidth: 150,
      hideable: false,
      sortable: false,
      type: 'actions',
      getActions: (params: GridRowParams) => {
        const id = params.id
        if (params.row.status === PowerStationStatus.Loading) {
          return [<CircularProgress key={params.id} size={24}/>]
        }

        const handleCancelClick = (id: GridRowId): void => {
          const editedRow = rows.find((row) => row.id === id)
          // eslint-disable-next-line
          if (editedRow?.isNew) {
            dispatch(deleteRowById(id))
          } else {
            dispatch(setRowMode({ id, props: { mode: GridRowModes.View, ignoreModifications: true } }))
          }
        }

        if (rowModesModel[id]?.mode === GridRowModes.Edit) {
          return [
            <Tooltip
              key="Save"
              disableInteractive
              title='Zapisz'>
            <span>
              <GridActionsCellItem
                icon={<Save />}
                label="Save"
                sx={{
                  color: 'primary.main'
                }}
                onClick={() => { dispatch(setRowMode({ id, props: { mode: GridRowModes.View } })) }} />
            </span>
            </Tooltip>,
            <Tooltip
              key="Cancel"
              disableInteractive
              title='Anuluj'>
            <span>
              <GridActionsCellItem
                icon={<Cancel />}
                label="Cancel"
                className="textPrimary"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation()
                  handleCancelClick(id)
                }}
                color="inherit" />
            </span>
            </Tooltip>
          ]
        }
        return [
          <Tooltip
            key="Edit"
            disableInteractive
            title='Edytuj'>
          <span>
            <GridActionsCellItem
              icon={<Edit />}
              label="Edit"
              className="textPrimary"
              onClick={() => { dispatch(setRowMode({ id, props: { mode: GridRowModes.Edit, fieldToFocus: 'ipv6' } })) }}
              color="inherit" />
          </span>
          </Tooltip>,
          <Tooltip
            key="Revalidate"
            disableInteractive
            title='Testuj połączenie'>
          <span>
            <GridActionsCellItem
              icon={<Autorenew />}
              label="Revalidate"
              onClick={() => { void dispatch(validatePowerStationByIpv6({ ipv6: params.row.ipv6, id })) }}
              color="inherit" />
          </span>
          </Tooltip>,
          <Tooltip
            key="Delete"
            disableInteractive
            title='Usuń'>
          <span>
            <GridActionsCellItem
              icon={<Delete />}
              label="Delete"
              onClick={() => { dispatch(deleteRowById(id)) }}
              color="inherit" />
          </span>
          </Tooltip>
        ]
      },
      renderHeader: (params: GridColumnHeaderParams) => (
        <Tooltip disableInteractive title={params.colDef.description}>
          <strong>{params.colDef.headerName}</strong>
        </Tooltip>
      )
    }
  ]
}

export default getColumns
