import * as React from 'react'
import Box from '@mui/material/Box'
import { WarningAmber } from '@mui/icons-material'
import Typography from '@mui/material/Typography'

const PowerStationErrorPage: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexFlow: 'column', flex: 1, minWidth: 0 }}>
      <WarningAmber sx={{ fontSize: 300 }} color={'disabled'} />
      <Typography variant={'h4'}>
        Błąd przy pobieraniu zasobu
      </Typography>
    </Box>
  )
}

export default PowerStationErrorPage
