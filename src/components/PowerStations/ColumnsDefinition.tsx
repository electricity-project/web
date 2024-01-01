import {
  GridActionsCellItem,
  type GridColDef,
  type GridColumnHeaderParams,
  type GridRenderCellParams,
  type GridRowParams
} from '@mui/x-data-grid'
import ipaddr from 'ipaddr.js'
import { CircularProgress, Tooltip } from '@mui/material'
import {
  HighlightOff, Info, Pause,
  PlayArrow
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  selectPendingRows,
  openDisconnectConfirmDialog,
  startPowerStation, stopPowerStation
} from '../../redux/slices/powerStationsSlice'
import { PowerStationState, powerStationStateToString, PowerStationType } from '../common/types'
import PowerStationTypeChip from '../common/PowerStationTypeChip'
import PowerStationStateChip from '../common/PowerStationStateChip'

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
      field: 'type',
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
      renderCell: (params: GridRenderCellParams<any, PowerStationType>) => (
        <PowerStationTypeChip powerStationType={params.value} />
      )
    },
    {
      field: 'state',
      headerName: 'Status',
      description: 'Status elektrowni',
      flex: 4,
      minWidth: 145,
      hideable: false,
      type: 'singleSelect',
      valueOptions: [PowerStationState.Working, PowerStationState.Stopped, PowerStationState.Damaged, PowerStationState.Maintenance],
      renderHeader: (params: GridColumnHeaderParams) => (
        <Tooltip disableInteractive title={params.colDef.description}>
          <strong>{params.colDef.headerName}</strong>
        </Tooltip>
      ),
      renderCell: (params: GridRenderCellParams<any, PowerStationState>) => (
        <PowerStationStateChip powerStationState={params.value} />
      )
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
          return [<CircularProgress key={params.id} size={24} />]
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

        if (params.row.state === PowerStationState.Working) {
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
          const isDisabled = params.row.state !== PowerStationState.Stopped
          actions.push(
            <Tooltip
              disableInteractive
              title={isDisabled ? `Nie można uruchomić gdy jest ${powerStationStateToString(params.row.state)}` : 'Uruchom pracę elektrowni'}>
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
