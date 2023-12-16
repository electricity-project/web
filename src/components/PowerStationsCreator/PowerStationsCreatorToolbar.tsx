import * as React from 'react'
import { GridToolbarContainer } from '@mui/x-data-grid'
import { Button, Tooltip } from '@mui/material'
import { Add } from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { addRow, selectIsLoading, selectRowsNumber } from '../../redux/slices/powerStationsCreatorSlice'

const MAX_ROWS_NUMBER = 100

const PowerStationsCreatorToolbar: React.FC = () => {
  const dispatch = useAppDispatch()
  const isLoading = useAppSelector(selectIsLoading)
  const rowsNumber = useAppSelector(selectRowsNumber)

  const handleClick = (): void => {
    dispatch(addRow({ ipv6: '0000:0000:0000:0000:0000:0000:0000:0000', isNew: true }))
  }

  const isAddButtonDisabled: boolean = isLoading || rowsNumber >= MAX_ROWS_NUMBER

  return (
    <GridToolbarContainer>
      <div style={{ flex: 1, minWidth: 0 }}></div>
      <Tooltip
        disableInteractive
        title={rowsNumber >= MAX_ROWS_NUMBER ? 'Osiągnięto limit 100 elektrowni możliwych do dodania za jednym razem' : ''}>
        <span>
          <Button color="primary" startIcon={<Add />} onClick={handleClick} disabled={isAddButtonDisabled} >
            Dodaj nową elektrownię
          </Button>
        </span>
      </Tooltip>
    </GridToolbarContainer>
  )
}

export default PowerStationsCreatorToolbar
