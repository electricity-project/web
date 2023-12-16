import {
  GridActionsCellItem,
  type GridColDef,
  type GridColumnHeaderParams,
  type GridRenderCellParams,
  type GridRowParams
} from '@mui/x-data-grid'
import ipaddr from 'ipaddr.js'
import { Chip, CircularProgress, Tooltip } from '@mui/material'
import {
  CheckCircleOutline,
  Construction,
  ErrorOutline, HighlightOff, Info, Pause,
  PauseCircleOutline, PlayArrow,
  SolarPower,
  WindPower
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  selectPendingRows,
  openDisconnectConfirmDialog,
  startPowerStation, stopPowerStation
} from '../../redux/slices/powerStationsSlice'

enum PowerStationStatus {
  Running = 'Uruchomiona',
  Stopped = 'Zatrzymana',
  Damaged = 'Uszkodzona',
  Maintenance = 'W naprawie'
}

enum PowerStationType {
  WindTurbine = 'Wiatrowa',
  SolarPanel = 'Słoneczna'
}

const getColumns = (afterAction: () => void): GridColDef[] => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const pendingRows = useAppSelector(selectPendingRows)
  return [
    {
      field: 'ipv6',
      headerName: 'Adres IPv6',
      description: 'Adres IPv6 elektrowni',
      minWidth: 303,
      width: 350,
      hideable: false,
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
      field: 'typ',
      headerName: 'Typ',
      description: 'Typ elektrowni',
      flex: 3,
      minWidth: 150,
      hideable: false,
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
        switch (params.value) {
          case PowerStationType.WindTurbine:
            color = '#6a86d3'
            icon = <WindPower color='inherit' />
            title = 'Turbina wiatrowa'
            break
          case PowerStationType.SolarPanel:
            color = '#e1b907'
            icon = <SolarPower color='inherit' />
            title = 'Panele solarne'
            break
          default:
            return null
        }
        return (
          <Tooltip disableInteractive title={title} >
            <Chip
              size="medium"
              variant="outlined"
              sx={{ color, borderColor: color }}
              icon={icon}
              label={params.value} />
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
      type: 'singleSelect',
      valueOptions: [PowerStationStatus.Running, PowerStationStatus.Stopped, PowerStationStatus.Damaged, PowerStationStatus.Maintenance],
      renderHeader: (params: GridColumnHeaderParams) => (
        <Tooltip disableInteractive title={params.colDef.description}>
          <strong>{params.colDef.headerName}</strong>
        </Tooltip>
      ),
      renderCell: (params: GridRenderCellParams<any, PowerStationStatus>) => {
        let icon
        let color
        let title
        switch (params.value) {
          case PowerStationStatus.Running:
            color = 'success' as const
            icon = <CheckCircleOutline />
            title = 'Elektrownia produkuje prąd'
            break
          case PowerStationStatus.Stopped:
            color = undefined
            icon = <PauseCircleOutline />
            title = 'Elektrownia nie produkuje prądu'
            break
          case PowerStationStatus.Damaged:
            color = 'error' as const
            icon = <ErrorOutline />
            title = 'Elektrownia jest niesprawna'
            break
          case PowerStationStatus.Maintenance:
            color = 'warning' as const
            icon = <Construction />
            title = 'Elektrownia jest naprawiana'
            break
          default:
            return null
        }
        return (
          <Tooltip disableInteractive title={title} >
            <Chip
              size="medium"
              variant="outlined"
              color={color}
              icon={icon}
              label={params.value} />
          </Tooltip>
        )
      }
    },
    {
      field: 'actions',
      headerName: 'Akcje',
      description: 'Możliwe do wykonania akcje',
      flex: 3,
      minWidth: 150,
      hideable: false,
      type: 'actions',
      getActions: (params: GridRowParams) => {
        if (Object.prototype.hasOwnProperty.call(pendingRows, params.id)) {
          return [<CircularProgress key={params.id} size={24}/>]
        }

        const actions: any[] = []
        actions.push(
          <Tooltip
            disableInteractive
            title='Zobacz szczegóły'>
            <span>
              <GridActionsCellItem
                icon={<Info color={'info'} sx={{ fontSize: 25 }} />}
                onClick={() => { navigate(`/power-stations/${params.row.id}`) }}
                label="Details"
                key={'details'} />
            </span>
          </Tooltip>)

        const onStop = (): void => {
          dispatch(stopPowerStation(params.id))
            .then((result) => {
              if (result.type === stopPowerStation.fulfilled.type) {
                afterAction()
              }
            }).catch(() => {})
        }

        const onStart = (): void => {
          dispatch(startPowerStation(params.id))
            .then((result) => {
              if (result.type === startPowerStation.fulfilled.type) {
                afterAction()
              }
            }).catch(() => {})
        }

        if (params.row.status === PowerStationStatus.Running) {
          actions.push(
            <Tooltip
              disableInteractive
              title='Zatrzymaj pracę elektrowni'>
            <span>
              <GridActionsCellItem
                icon={<Pause sx={{ fontSize: 25 }} />}
                onClick={onStop}
                label="Stop"
                key={'stop'} />
            </span>
            </Tooltip>)
        } else {
          const isDisabled = params.row.status !== PowerStationStatus.Stopped
          actions.push(
            <Tooltip
              disableInteractive
              title={isDisabled ? `Nie można uruchomić gdy jest ${params.row.status.toLowerCase()}` : 'Uruchom pracę elektrowni'}>
            <span>
              <GridActionsCellItem
                disabled={isDisabled}
                icon={<PlayArrow sx={{ fontSize: 25 }} />}
                onClick={onStart}
                label="Start"
                key={'start'} />
            </span>
            </Tooltip>)
        }
        actions.push(
          <Tooltip
            disableInteractive
            title='Odłącz elektrownię od systemu'>
          <span>
            <GridActionsCellItem
              icon={<HighlightOff color={'error'} sx={{ fontSize: 25 }} />}
              onClick={() => { dispatch(openDisconnectConfirmDialog(params.id)) }}
              label="Disconnect"
              key={'disconnect'} />
          </span>
          </Tooltip>)
        return actions
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
