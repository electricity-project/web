import { Clear, OpenInNew, Save, Visibility, VisibilityOff } from '@mui/icons-material'
import {
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Tooltip
} from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import * as React from 'react'
import { useEffect, useState } from 'react'

import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  clearWeatherApiError,
  selectIsLoadingWeatherApiKey, selectIsWeatherApiKeyError,
  selectWeatherApiKey,
  setWeatherApiKey
} from '../../redux/slices/adminPanelSlice'
import UnsavedChangesPrompt from '../common/UnsavedChangesPrompt'

const WeatherApiKey: React.FC = () => {
  const dispatch = useAppDispatch()
  const isLoadingWeatherApiKey = useAppSelector(selectIsLoadingWeatherApiKey)
  const isWeatherApiKeyError = useAppSelector(selectIsWeatherApiKeyError)
  const weatherApiKey = useAppSelector(selectWeatherApiKey)
  const [showApiKey, setShowApiKey] = useState(false)
  const [tempWeatherApiKey, setTempWeatherApiKey] = useState<string>(weatherApiKey)

  useEffect(() => {
    setTempWeatherApiKey(weatherApiKey)
  }, [weatherApiKey])

  const handleSeeDetails = (): void => {
    window.open('https://www.weatherapi.com/docs/', '_blank', 'noreferrer')
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (isWeatherApiKeyError) {
      dispatch(clearWeatherApiError())
    }
    setTempWeatherApiKey(event.target.value)
  }

  const handleClickShowWeatherApiKey = (): void => {
    setShowApiKey((show) => !show)
  }

  const handleMouseDownWeatherApiKey = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault()
  }

  const handleSave = (): void => {
    void dispatch(setWeatherApiKey(tempWeatherApiKey))
  }

  const handleCancel = (): void => {
    if (isWeatherApiKeyError) {
      dispatch(clearWeatherApiError())
    }
    setTempWeatherApiKey(weatherApiKey)
  }

  const isWeatherApiKeyChanged = tempWeatherApiKey !== weatherApiKey

  return (
    <>
      <UnsavedChangesPrompt hasUnsavedChanges={isWeatherApiKeyChanged} />
      <Stack direction="row" spacing={1.5} mb={2}>
        <Typography variant={'h5'} sx={{ whiteSpace: 'nowrap', pt: 0.5 }}>
          Weather API
        </Typography>
        <Tooltip
          disableInteractive
          title='Zobacz szczegóły'>
          <IconButton onClick={handleSeeDetails} sx={{ padding: 1 }}>
            <OpenInNew sx={{ fontSize: 24 }}/>
          </IconButton>
        </Tooltip>
      </Stack>
      <Stack direction="row" spacing={2} mb={4}>
        <FormControl error={isWeatherApiKeyError} sx={{ width: '32ch' }} variant="outlined">
          <InputLabel htmlFor="outlined-adornment-password">Klucz API</InputLabel>
          <OutlinedInput
            id="outlined-adornment-password"
            defaultValue={weatherApiKey}
            value={tempWeatherApiKey}
            onChange={handleChange}
            type={showApiKey ? 'text' : 'password'}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowWeatherApiKey}
                  onMouseDown={handleMouseDownWeatherApiKey}
                  edge="end"
                >
                  {showApiKey ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Klucz API"
          />
        </FormControl>
          {isLoadingWeatherApiKey
            ? (
              <Box sx={{ display: 'flex', alignItems: 'center', width: 96, justifyContent: 'center' }}>
                <CircularProgress size={32} />
              </Box>
              )
            : (
              <Stack direction="row" py={0.5}>
                <Tooltip
                  disableInteractive
                  title='Zapisz'>
                  <IconButton disabled={!isWeatherApiKeyChanged} onClick={handleSave}>
                    <Save sx={{ fontSize: 32, color: isWeatherApiKeyChanged ? 'primary.main' : 'default' }}/>
                  </IconButton>
                </Tooltip>
                <Tooltip
                  disableInteractive
                  title='Anuluj'>
                  <IconButton disabled={!isWeatherApiKeyChanged} onClick={handleCancel}>
                    <Clear sx={{ fontSize: 32 }}/>
                  </IconButton>
                </Tooltip>
              </Stack>
              )
          }
      </Stack>
    </>
  )
}

export default WeatherApiKey
