import { Add } from '@mui/icons-material'
import { Button } from '@mui/material'
import { GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid'
import * as React from 'react'
import { Link } from 'react-router-dom'

const PowerStationsToolbar: React.FC = () => {
  return (
    <GridToolbarContainer>
      <GridToolbarQuickFilter placeholder={'IPv6, Typ, Status...'} debounceMs={500} />
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
