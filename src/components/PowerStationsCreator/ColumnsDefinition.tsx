import {
  GridActionsCellItem,
  type GridColDef,
  type GridColumnHeaderParams, type GridRenderCellParams,
  type GridRenderEditCellParams,
  type GridRowId,
  GridRowModes,
  type GridRowParams,
  useGridApiContext
} from '@mui/x-data-grid'
import ipaddr from 'ipaddr.js'
import { Chip, CircularProgress, TextField, Tooltip } from '@mui/material'
import {
  Autorenew,
  Cancel,
  CheckCircleOutline, Delete,
  Edit,
  ErrorOutline,
  HelpOutline,
  Save
} from '@mui/icons-material'
import * as React from 'react'
import {
  deleteRowById,
  selectRowModesModel, selectRows, setRowMode, validatePowerStationByIpv6
} from '../../redux/slices/powerStationsCreatorSlice'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { IMaskInput } from 'react-imask'
import { forwardRef } from 'react'
import { PowerStationCreationStatus, PowerStationType } from '../common/types'
import PowerStationTypeChip from '../common/PowerStationTypeChip'

interface CustomProps {
  onChange: (event: { target: { name: string, value: string } }) => void
  name: string
}

const Ipv6MaskInput = forwardRef<HTMLInputElement, CustomProps>(
  function TextMaskCustom (props, ref) {
    const { onChange, ...other } = props
    return (
      <IMaskInput
        {...other}
        mask="####:####:####:####:####:####:####:####"
        definitions={{
          '#': /[0-9a-f]/
        }}
        placeholderChar={'0'}
        autofix={true}
        lazy={false}
        inputRef={ref}
        onAccept={(value: any) => { onChange({ target: { name: props.name, value } }) }}
        overwrite
      />
    )
  }
)

const Ipv6Editor: React.FC<GridRenderEditCellParams> = (props) => {
  const { id, value, field } = props
  const apiRef = useGridApiContext()
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = event.target.value
    if (ipaddr.isValid(newValue)) {
      void apiRef.current.setEditCellValue({ id, field, value: newValue })
    }
  }

  return (
    <TextField
      value={value}
      onChange={handleChange}
      InputProps={{
        inputComponent: Ipv6MaskInput as any,
        disableUnderline: true,
        style: { fontSize: '0.875rem', padding: '1px 0' }
      }}
      variant="standard"
      defaultValue={'0000:0000:0000:0000:0000:0000:0000:0000'}
      placeholder={'0000:0000:0000:0000:0000:0000:0000:0000'}
      fullWidth
      sx={{ paddingX: 2 }}
      autoFocus />
  )
}

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
      renderEditCell: (params: GridRenderEditCellParams) => (<Ipv6Editor {...params} />),
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
      renderCell: (params: GridRenderCellParams<any, PowerStationType>) => (
        <PowerStationTypeChip powerStationType={params.value} />
      )
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
      valueOptions: [PowerStationCreationStatus.Success, PowerStationCreationStatus.Error, PowerStationCreationStatus.Loading],
      renderHeader: (params: GridColumnHeaderParams) => (
        <Tooltip disableInteractive title={params.colDef.description}>
          <strong>{params.colDef.headerName}</strong>
        </Tooltip>
      ),
      renderCell: (params: GridRenderCellParams<any, PowerStationCreationStatus>) => {
        let icon
        let color
        let label
        let title
        switch (params.value) {
          case PowerStationCreationStatus.Success:
            color = 'success' as const
            icon = <CheckCircleOutline />
            label = 'Gotowa'
            title = 'Elektrownia gotowa do podłączenia'
            break
          case PowerStationCreationStatus.Error:
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
        if (params.row.status === PowerStationCreationStatus.Loading) {
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
