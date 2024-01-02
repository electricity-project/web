import { GridToolbarContainer } from '@mui/x-data-grid'
import { Button } from '@mui/material'
import { Add } from '@mui/icons-material'
import * as React from 'react'
import Typography from '@mui/material/Typography'
import { useAppDispatch } from '../../redux/hooks'
import { openCreateUserDialog } from '../../redux/slices/adminPanelSlice'

const AdminPanelToolbar: React.FC = () => {
  const dispatch = useAppDispatch()

  return (
    <GridToolbarContainer>
      <Typography variant={'h5'} sx={{ whiteSpace: 'nowrap', paddingLeft: 1 }}>
        Zarządzanie użytkownikami
      </Typography>
      <div style={{ flex: 1, minWidth: 0 }}></div>
      <Button
        color="primary"
        startIcon={<Add />}
        onClick={() => { dispatch(openCreateUserDialog()) }}
      >
        Dodaj nowego użytkownika
      </Button>
    </GridToolbarContainer>
  )
}

export default AdminPanelToolbar
