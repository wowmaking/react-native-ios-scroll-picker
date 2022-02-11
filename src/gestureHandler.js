import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useCode, set, Value, add, call, } from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { usePanGestureHandler } from './redash';
import { withDecay } from './animationHelpers';
const GestureHandler = ({ value, max, onValueChange, defaultValue, values, visibleItems, itemHeight }) => {
    const { gestureHandler, translation, velocity, state, } = usePanGestureHandler();
    const snapPoints = new Array(max).fill(0).map((_, i) => i * -itemHeight);
    const translateY = useMemo(() => withDecay({
        itemHeight,
        value: translation.y,
        velocity: velocity.y,
        state,
        snapPoints,
        defaultValue,
        values,
        offset: new Value(0),
    }), [values]);
    useCode(() => [set(value, add(translateY, itemHeight * Math.floor(visibleItems / 2)))], []);
    useCode(() => call([translateY], ([currentValue]) => {
        const selectedIndex = Math.round(-currentValue / itemHeight);
        const newValue = values[selectedIndex]?.value;
        if (typeof onValueChange === 'function' && newValue !== null && newValue !== undefined) {
            onValueChange(newValue);
        }
    }), [translateY]);
    return (<PanGestureHandler {...gestureHandler}>
      <Animated.View style={StyleSheet.absoluteFill}/>
    </PanGestureHandler>);
};
export default GestureHandler;
