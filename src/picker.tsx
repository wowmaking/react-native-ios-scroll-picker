import React, { useMemo } from 'react';
import {View, StyleSheet, Text, ViewStyle, TextStyle} from 'react-native';
import Animated, {
  interpolateNode,
  Extrapolate,
  sub,
  divide,
  useValue,
  multiply,
  asin,
  cos,
} from 'react-native-reanimated';

import { translateZ } from './redash';
import GestureHandler from './gestureHandler';

const perspective = 1600;

interface PickerProps {
  values: { value: number | string; label: string }[];
  visibleItems: number;
  itemHeight: number;
  defaultValue?: number | string;
  onChange?: (value: number | string) => void;
  withTranslateZ?: boolean;
  withScale?: boolean;
  withOpacity?: boolean;
  containerStyle?: ViewStyle;
  dividerStyle?: ViewStyle;
  labelStyle?: TextStyle;
}

const Picker = ({
    values,
    defaultValue,
    visibleItems,
    itemHeight,
    onChange,
    withTranslateZ,
    withScale,
    withOpacity,
    containerStyle,
    dividerStyle,
    labelStyle,
  }: PickerProps) => {
  const translateY = useValue(0);
  const roundedItems = Math.floor(visibleItems / 2)
  const radiusRel = visibleItems * 0.5;
  const radius = radiusRel * itemHeight;

  const renderItems = useMemo(() => (
    <Animated.View style={{ transform: [{ translateY }] }}>
      {values.map((v, i) => {
        const transform = [];
        const node = divide(sub(translateY, itemHeight * roundedItems), -itemHeight);

        const opacity = !withOpacity ? 1 : interpolateNode(
          node,
          {
            inputRange: [i - visibleItems, i, i + visibleItems],
            outputRange: [0.2, 1, 0.2],
            extrapolate: Extrapolate.CLAMP,
          }
        );

        if (withScale) {
          const scale = interpolateNode(
            node,
            {
              inputRange: [i - visibleItems, i, i + visibleItems],
              outputRange: [0.5, 1, 0.5],
              extrapolate: Extrapolate.CLAMP,
            }
          );

          transform.push({ scale });
        }

        if (withTranslateZ) {
          transform.push({ perspective });

          const y = interpolateNode(
            node,
            {
              inputRange: [i - radiusRel, i, i + radiusRel],
              outputRange: [-1, 0, 1],
              extrapolate: Extrapolate.CLAMP,
            }
          );
          const rotateX: any = asin(y);
          transform.push({ rotateX });
          const z = sub(multiply(radius, cos(rotateX)), radius);

          transform.push(translateZ(perspective, z));
        }

        return (
          <Animated.View
            key={v.value}
            style={[
              styles.item,
              {
                height: itemHeight,
                opacity,
                transform,
              },
            ]}
          >
            <Text style={[styles.label, labelStyle]}>{v.label}</Text>
          </Animated.View>
        );
      })}
    </Animated.View>
  ), []);

  return (
    <View style={[styles.container, { height: itemHeight * visibleItems }, containerStyle]}>
      <View style={StyleSheet.absoluteFill}>
        <View
          style={
            [{
              top: itemHeight * roundedItems,
              height: itemHeight,
            },
            dividerStyle,
          ]}
        />
      </View>
      {renderItems}
      <GestureHandler
        values={values}
        max={values.length}
        value={translateY}
        onValueChange={onChange}
        defaultValue={defaultValue}
        visibleItems={visibleItems}
        itemHeight={itemHeight}
      />
    </View>
  );
};

export default Picker;

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  item: {
    justifyContent: 'center',
  },
  label: {
    color: '#000000',
    fontWeight: '500',
    fontSize: 24,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});
