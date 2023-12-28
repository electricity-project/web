import { useEffect, useCallback, useRef } from 'react'
import {
  useBeforeUnload,
  useBlocker
} from 'react-router-dom'

const UnsavedChangesPrompt = ({ hasUnsavedChanges }: { hasUnsavedChanges: boolean }): null => {
  const onLocationChange = useCallback(
    ({ nextLocation }: { nextLocation: any }) => {
      // eslint-disable-next-line
      if (nextLocation?.state?.block !== undefined && !nextLocation.state.block) {
        return false
      } else if (hasUnsavedChanges) {
        return !window.confirm('Wprowadzone zmiany nie zostaną zapisane.')
      }
      return false
    }, [hasUnsavedChanges]
  )

  usePrompt(onLocationChange, hasUnsavedChanges)
  useBeforeUnload(
    useCallback(
      (event) => {
        if (hasUnsavedChanges) {
          event.preventDefault()
          event.returnValue = ''
        }
      },
      [hasUnsavedChanges]
    ),
    { capture: true }
  )

  return null
}

const usePrompt = (
  onLocationChange: ({ nextLocation }: { nextLocation: any }) => boolean,
  hasUnsavedChanges: boolean
): void => {
  const blocker = useBlocker(hasUnsavedChanges ? onLocationChange : false)
  const prevState = useRef(blocker.state)
  useEffect(() => {
    if (blocker.state === 'blocked') {
      blocker.reset()
    }
    prevState.current = blocker.state
  }, [blocker])
}

export default UnsavedChangesPrompt
