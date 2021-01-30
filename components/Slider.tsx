import * as React from 'react'
import { useSlider, useSliderThumb } from '@react-aria/slider'
import { useSliderState } from '@react-stately/slider'
import { useFocusRing } from '@react-aria/focus'
import { VisuallyHidden } from '@react-aria/visually-hidden'
import { mergeProps } from '@react-aria/utils'
import { useNumberFormatter } from '@react-aria/i18n'

const Slider = (props): JSX.Element => {
  const trackRef = React.useRef(null)
  const numberFormatter = useNumberFormatter(props.formatOptions)
  const state = useSliderState({ ...props, numberFormatter })
  const { groupProps, trackProps, labelProps, outputProps } = useSlider(
    props,
    state,
    trackRef
  )
  return (
    <div
      {...groupProps}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: 300,
        touchAction: 'none',
      }}
    >
      {/* Create a flex container for the label and output element. */}
      <div style={{ display: 'flex', alignSelf: 'stretch' }}>
        {props.label && <label {...labelProps}>{props.label}</label>}
        <output {...outputProps} style={{ flex: '1 0 auto', textAlign: 'end' }}>
          {state.getThumbValueLabel(0)}
        </output>
      </div>
      {/* The track element holds the visible track line and the thumb. */}
      <div
        {...trackProps}
        ref={trackRef}
        style={{
          position: 'relative',
          height: 30,
          width: ' 100%',
        }}
      >
        <div
          style={{
            position: 'absolute',
            backgroundColor: 'gray',
            height: 3,
            top: 13,
            width: '100%',
          }}
        />
        <Thumb index={0} state={state} trackRef={trackRef} />
      </div>
    </div>
  )
}

const Thumb = (props) => {
  const { state, trackRef, index } = props
  const inputRef = React.useRef(null)
  const { thumbProps, inputProps } = useSliderThumb(
    {
      index,
      trackRef,
      inputRef,
    },
    state
  )

  const { focusProps, isFocusVisible } = useFocusRing()
  return (
    <div
      style={{
        position: 'absolute',
        top: 4,
        transform: 'translateX(-50%)',
        left: `${state.getThumbPercent(index) * 100}%`,
      }}
    >
      <div
        {...thumbProps}
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          backgroundColor: isFocusVisible
            ? 'orange'
            : state.isThumbDragging(index)
            ? 'dimgrey'
            : 'gray',
        }}
      >
        <VisuallyHidden>
          <input ref={inputRef} {...mergeProps(inputProps, focusProps)} />
        </VisuallyHidden>
      </div>
    </div>
  )
}

export default Slider
