import * as React from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
  type GridRowParams,
  type GridRowsProp,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  gridClasses,
  plPL,
  type GridColumnHeaderParams,
  type GridRenderCellParams
} from '@mui/x-data-grid'
import ipaddr from 'ipaddr.js'
import {
  Add,
  CheckCircleOutline,
  Construction,
  ErrorOutline,
  HighlightOff,
  Info,
  Pause, PauseCircleOutline,
  PlayArrow, SolarPower, WindPower
} from '@mui/icons-material'
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Tooltip } from '@mui/material'
import { type JSX } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// type PowerStationStatus = 'Uruchomiona' | 'Zatrzymana' | 'Uszkodzona' | 'W naprawie'
// type PowerStationType = 'Wiatrowa' | 'Słoneczna'

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

const rows: GridRowsProp = [
  { id: 1, ipv6: '0000:0000:0000:0000:0000:0000:0000:0001', status: PowerStationStatus.Running, typ: PowerStationType.WindTurbine },
  { id: 2, ipv6: '0000:0000:0000:0000:0000:0000:0000:0002', status: PowerStationStatus.Stopped, typ: PowerStationType.WindTurbine },
  { id: 3, ipv6: '0000:0000:0000:0000:0000:0000:0000:0003', status: PowerStationStatus.Damaged, typ: PowerStationType.SolarPanel },
  { id: 4, ipv6: '0000:0000:0000:0000:0000:0000:0000:0004', status: PowerStationStatus.Maintenance, typ: PowerStationType.SolarPanel },
  { id: 5, ipv6: '0000:0000:0000:0000:0000:0000:0000:0005', status: PowerStationStatus.Maintenance, typ: PowerStationType.SolarPanel },
  { id: 6, ipv6: '0000:0000:0000:0000:0000:0000:0000:0006', status: PowerStationStatus.Maintenance, typ: PowerStationType.SolarPanel },
  { id: 7, ipv6: '0000:0000:0000:0000:0000:0000:0000:0007', status: PowerStationStatus.Maintenance, typ: PowerStationType.SolarPanel },
  { id: 8, ipv6: '0000:0000:0000:0000:0000:0000:0000:0008', status: PowerStationStatus.Maintenance, typ: PowerStationType.SolarPanel },
  { id: 9, ipv6: '0000:0000:0000:0000:0000:0000:0000:0009', status: PowerStationStatus.Maintenance, typ: PowerStationType.SolarPanel },
  { id: 10, ipv6: '0000:0000:0000:0000:0000:0000:0000:000a', status: PowerStationStatus.Maintenance, typ: PowerStationType.SolarPanel },
  { id: 11, ipv6: '0000:0000:0000:0000:0000:0000:0000:000b', status: PowerStationStatus.Maintenance, typ: PowerStationType.SolarPanel },
  { id: 12, ipv6: '0000:0000:0000:0000:0000:0000:0000:000c', status: PowerStationStatus.Maintenance, typ: PowerStationType.SolarPanel },
  { id: 13, ipv6: '0000:0000:0000:0000:0000:0000:0000:000d', status: PowerStationStatus.Maintenance, typ: PowerStationType.SolarPanel },
  { id: 14, ipv6: '0000:0000:0000:0000:0000:0000:0000:000e', status: PowerStationStatus.Maintenance, typ: PowerStationType.SolarPanel },
  { id: 15, ipv6: '0000:0000:0000:0000:0000:0000:0000:000f', status: PowerStationStatus.Maintenance, typ: PowerStationType.SolarPanel },
  { id: 16, ipv6: '0000:0000:0000:0000:0000:0000:0000:0010', status: PowerStationStatus.Maintenance, typ: PowerStationType.SolarPanel },
  { id: 17, ipv6: '0000:0000:0000:0000:0000:0000:0000:0011', status: PowerStationStatus.Maintenance, typ: PowerStationType.SolarPanel },
  { id: 18, ipv6: '0000:0000:0000:0000:0000:0000:0000:0012', status: PowerStationStatus.Maintenance, typ: PowerStationType.SolarPanel },
  { id: 19, ipv6: '0000:0000:0000:0000:0000:0000:0000:0013', status: PowerStationStatus.Maintenance, typ: PowerStationType.SolarPanel },
  { id: 20, ipv6: '0000:0000:0000:0000:0000:0000:0000:0014', status: PowerStationStatus.Maintenance, typ: PowerStationType.SolarPanel }
]

function PowerStationsToolbar (): JSX.Element {
  return (
    <GridToolbarContainer>
      <GridToolbarQuickFilter placeholder={'IPv6, Status, Typ...'}/>
      <div style={{ flex: 1, minWidth: 0 }}></div>
      <Button
        color="primary"
        startIcon={<Add />}
        component={Link}
        to={'/power-stations/new'}
      >
        Dodaj nowe elektrownie
      </Button>
    </GridToolbarContainer>
  )
}

const PowerStations: React.FC = () => {
  const [promiseArguments, setPromiseArguments] = React.useState<any>(null)

  const columns: GridColDef[] = [
    {
      field: 'ipv6',
      headerName: 'Adres IPv6',
      description: 'Adres IPv6 elektrowni',
      flex: 4,
      minWidth: 303,
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
      field: 'actions',
      headerName: 'Akcje',
      description: 'Możliwe do wykonania akcje',
      flex: 3,
      minWidth: 150,
      hideable: false,
      type: 'actions',
      getActions: (params: GridRowParams) => {
        const actions: any[] = []
        if (params?.row?.status === undefined) {
          return actions
        }

        const navigate = useNavigate()

        actions.push(
          <Tooltip
            disableInteractive
            title='Zobacz szczegóły'>
            <span>
              <GridActionsCellItem
                icon={<Info color={'info'} />}
                onClick={() => { navigate(`/power-stations/${params.row.id}`) }}
                label="Details"
                key={'details'} />
            </span>
          </Tooltip>)

        if (params.row.status === PowerStationStatus.Running) {
          actions.push(
            <Tooltip
              disableInteractive
              title='Zatrzymaj pracę elektrowni'>
            <span>
              <GridActionsCellItem
                icon={<Pause />}
                onClick={() => { console.log('stop') }}
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
                icon={<PlayArrow />}
                onClick={() => { console.log('start') }}
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
              icon={<HighlightOff color={'error'} />}
              onClick={() => { setPromiseArguments({ id: params.id }) }}
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

  const handleNo = (): void => {
    // const { oldRow, resolve } = promiseArguments
    // resolve(oldRow) // Resolve with the old row to not update the internal state
    setPromiseArguments(null)
  }

  const handleYes = (): void => {
    // const { newRow, oldRow, reject, resolve } = promiseArguments

    try {
      // Make the HTTP request to save in the backend
      // const response = await mutateRow(newRow)
      // setSnackbar({ children: 'User successfully saved', severity: 'success' })
      // resolve(response)
      setPromiseArguments(null)
    } catch (error) {
      // setSnackbar({ children: "Name can't be empty", severity: 'error' })
      // reject(oldRow)
      setPromiseArguments(null)
    }
  }

  const renderDisconnectConfirmDialog = (): null | JSX.Element => {
    if (promiseArguments === null) {
      return null
    }

    // const { newRow, oldRow } = promiseArguments
    // const mutation = computeMutation(newRow, oldRow)

    return (
      <Dialog
        maxWidth="xs"
        // TransitionProps={{ onEntered: handleEntered }}
        open={true}
      >
        <DialogTitle>Czy jesteś pewny?</DialogTitle>
        <DialogContent dividers>
          {'Wybrana elektrownia zostanie odłączona od systemu. Czy chcesz kontunuować?'}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNo}>Nie</Button>
          <Button onClick={handleYes}>Tak</Button>
        </DialogActions>
      </Dialog>
    )
  }

  return (
    <>
      {renderDisconnectConfirmDialog()}
      <Typography variant='h4' mb={1}>
        Elektrownie
      </Typography>
      <Box sx={{
        width: '100%', minHeight: 0, flex: 1, display: 'flex', flexFlow: 'column', typography: 'body1', mt: 3
      }}>
        <DataGrid
          slots={{
            toolbar: PowerStationsToolbar
          }}
          disableColumnMenu
          disableColumnSelector
          disableRowSelectionOnClick
          autoPageSize
          // paginationMode='server'
          columns={columns}
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
