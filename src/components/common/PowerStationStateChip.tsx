import * as React from 'react'
import { PowerStationState } from './types'
import { CheckCircleOutline, Construction, ErrorOutline, HelpOutline, PauseCircleOutline } from '@mui/icons-material'
import { Chip, Tooltip } from '@mui/material'

const PowerStationStateChip: React.FC<{ powerStationState: PowerStationState | undefined }> = ({ powerStationState }) => {
  let icon, color, title, label
  switch (powerStationState) {
    case PowerStationState.Working:
      color = 'success' as const
      icon = <CheckCircleOutline />
      title = 'Elektrownia produkuje prąd'
      label = 'Uruchomiona'
      break
    case PowerStationState.Stopped:
      color = undefined
      icon = <PauseCircleOutline />
      title = 'Elektrownia nie produkuje prądu'
      label = 'Zatrzymana'
      break
    case PowerStationState.Damaged:
      color = 'error' as const
      icon = <ErrorOutline />
      title = 'Elektrownia jest niesprawna'
      label = 'Uszkodzona'
      break
    case PowerStationState.Maintenance:
      color = 'warning' as const
      icon = <Construction />
      title = 'Elektrownia jest naprawiana'
      label = 'W naprawie'
      break
    default:
      color = 'default' as const
      icon = <HelpOutline />
      label = 'Nieznany'
      title = 'Status elektrowni jest nieznany'
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

export default PowerStationStateChip
