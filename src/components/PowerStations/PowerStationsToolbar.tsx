import { GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid'
import { Button } from '@mui/material'
import { Add } from '@mui/icons-material'
import { Link } from 'react-router-dom'
import * as React from 'react'

const PowerStationsToolbar: React.FC = () => {
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

export default PowerStationsToolbar
