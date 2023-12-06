import * as React from 'react'
import { GridToolbarContainer } from '@mui/x-data-grid'
import { Button } from '@mui/material'
import { Add } from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { addRow, selectIsLoading } from '../../redux/slices/powerStationCreatorSlice'

const PowerStationsCreatorToolbar: React.FC = () => {
  const dispatch = useAppDispatch()
  const isLoading = useAppSelector(selectIsLoading)

  const handleClick = (): void => {
    dispatch(addRow({ ipv6: '0000:0000:0000:0000:0000:0000:0000:0000', isNew: true }))
  }

  return (
    <GridToolbarContainer>
      <div style={{ flex: 1, minWidth: 0 }}></div>
      <Button color="primary" startIcon={<Add />} onClick={handleClick} disabled={isLoading} >
        Dodaj nową elektrownię
      </Button>
    </GridToolbarContainer>
  )
}

export default PowerStationsCreatorToolbar
