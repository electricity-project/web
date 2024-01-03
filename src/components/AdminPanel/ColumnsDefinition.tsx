import {
  Delete,
  Edit
} from '@mui/icons-material'
import { CircularProgress, Tooltip } from '@mui/material'
import {
  GridActionsCellItem,
  type GridColDef,
  type GridColumnHeaderParams,
  type GridRenderCellParams, type GridRowParams
} from '@mui/x-data-grid'
import * as React from 'react'

import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { openDeleteUserConfirmDialog, openEditUserDialog, selectPendingRows } from '../../redux/slices/adminPanelSlice'
import { selectUser } from '../../redux/slices/userAuthSlice'
import {
  UserRole,
  userRoleToString
} from '../common/types'

const getColumns = (): GridColDef[] => {
  const dispatch = useAppDispatch()
  const pendingRows = useAppSelector(selectPendingRows)
  const user = useAppSelector(selectUser)
  return [
    {
      field: 'username',
      headerName: 'Nazwa użytkownika',
      description: 'Login / Nazwa użytkownika',
      minWidth: 303,
      flex: 5,
      hideable: false,
      renderHeader: (params: GridColumnHeaderParams) => (
        <Tooltip disableInteractive title={params.colDef.description}>
          <strong>{params.colDef.headerName}</strong>
        </Tooltip>
      )
    },
    {
      field: 'role',
      headerName: 'Rola',
      description: 'Rola użytkownika',
      flex: 3,
      minWidth: 150,
      hideable: false,
      type: 'singleSelect',
      valueOptions: [UserRole.Admin, UserRole.User],
      renderHeader: (params: GridColumnHeaderParams) => (
        <Tooltip disableInteractive title={params.colDef.description}>
          <strong>{params.colDef.headerName}</strong>
        </Tooltip>
      ),
      renderCell: (params: GridRenderCellParams<any, UserRole>) => (
        <>{params.value === undefined ? '' : userRoleToString(params.value, true)}</>
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
              onClick={() => { dispatch(openEditUserDialog(params.id)) }}
              color="inherit" />
          </span>
          </Tooltip>,
          <Tooltip
            key="Delete"
            disableInteractive
            title={user?.username === params.row.username ? 'Nie można usunąć swojego profilu' : 'Usuń'}>
          <span>
            <GridActionsCellItem
              icon={<Delete />}
              disabled={user?.username === params.row.username}
              label="Delete"
              onClick={() => { dispatch(openDeleteUserConfirmDialog(params.id)) }}
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
