import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useCode,
  set,
  Value,
  add,
  call,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import RNHapticFeedback from 'react-native-haptic-feedback';

import { usePanGestureHandler } from  './redash';
import { withDecay } from './animationHelpers';

interface GestureHandlerProps {
  values: { value: number | string; label: string }[];
  visibleItems: number;
  itemHeight: number;
  value: Animated.Value<number>;
  max: number;
  defaultValue?: number | string;
  onValueChange?: (value: number | string) => void;
}

const GestureHandler = ({ value, max, onValueChange, defaultValue, values, visibleItems, itemHeight }: GestureHandlerProps) => {
  const {
    gestureHandler,
    translation,
    velocity,
    state,
  } = usePanGestureHandler();
  
  const snapPoints = new Array(max).fill(0).map((_, i) => i * -itemHeight);
  const translateY = useMemo(
    () =>
      withDecay({
        itemHeight,
        value: translation.y,
        velocity: velocity.y,
        state,
        snapPoints,
        defaultValue,
        values,
        offset: new Value(0),
      }),
    [values],
  );

  useCode(() => [set(value, add(translateY, itemHeight * Math.floor(visibleItems / 2)))], []);

  useCode(() => call([translateY], ([currentValue]: any): void => {
    const selectedIndex = Math.round(-currentValue / itemHeight);
    const newValue = values[selectedIndex]?.value;

    RNHapticFeedback.trigger('selection', {
      enableVibrateFallback: false,
      ignoreAndroidSystemSettings: false,
    });

    if (typeof onValueChange === 'function' && newValue) {
      onValueChange(newValue);
    }
  }), [translateY]);

  return (
    <PanGestureHandler {...gestureHandler}>
      <Animated.View style={StyleSheet.absoluteFill} />
    </PanGestureHandler>
  );
};

export default GestureHandler;