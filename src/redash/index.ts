import { useRef } from "react";
import Animated from "react-native-reanimated";
import { State } from "react-native-gesture-handler";
import type {
  FlingGestureHandlerEventPayload,
  ForceTouchGestureHandlerEventPayload,
  GestureHandlerStateChangeNativeEvent,
  LongPressGestureHandlerEventPayload,
  PanGestureHandlerEventPayload,
  PinchGestureHandlerEventPayload,
  RotationGestureHandlerEventPayload,
  TapGestureHandlerEventPayload,
} from "react-native-gesture-handler";

const { divide, sub, Value, event, multiply, add, min, abs, cond, eq } = Animated;

export const translateZ = (
  perspective: Animated.Adaptable<number>,
  z: Animated.Adaptable<number>
) => ({ scale: divide(perspective, sub(perspective, z)) });

function useConst<T>(initialValue: T | (() => T)): T {
  const ref = useRef<{ value: T }>();
  if (ref.current === undefined) {
    // Box the value in an object so we can tell if it's initialized even if the initializer
    // returns/is undefined
    ref.current = {
      value:
        typeof initialValue === "function"
          ? // eslint-disable-next-line @typescript-eslint/ban-types
            (initialValue as Function)()
          : initialValue,
    };
  }
  return ref.current.value;
}

interface Vector<
  T extends Animated.Adaptable<number> = Animated.Adaptable<number>
> {
  x: T;
  y: T;
}

type Create = {
  (): Vector<0>;
  <T extends Animated.Adaptable<number>>(x: T, y?: T): Vector<T>;
};

const create: Create = <T extends Animated.Adaptable<number>>(
  x?: T,
  y?: T
) => ({
  x: x ?? 0,
  y: y ?? x ?? 0,
});

type NativeEvent = GestureHandlerStateChangeNativeEvent &
  (
    | PanGestureHandlerEventPayload
    | TapGestureHandlerEventPayload
    | LongPressGestureHandlerEventPayload
    | RotationGestureHandlerEventPayload
    | FlingGestureHandlerEventPayload
    | PinchGestureHandlerEventPayload
    | ForceTouchGestureHandlerEventPayload
  );

type Adaptable<T> = { [P in keyof T]: Animated.Adaptable<T[P]> };

const createValue = (x = 0, y?: number) =>
  create(new Value(x), new Value(y ?? x));

const onGestureEvent = (
  nativeEvent: Partial<Adaptable<NativeEvent>>
) => {
  const gestureEvent = event([{ nativeEvent }]);
  return {
    onHandlerStateChange: gestureEvent,
    onGestureEvent: gestureEvent,
  };
};

const panGestureHandler = () => {
  const position = createValue(0);
  const translation = createValue(0);
  const velocity = createValue(0);
  const state = new Value(State.UNDETERMINED);
  const gestureHandler = onGestureEvent({
    x: position.x,
    translationX: translation.x,
    velocityX: velocity.x,
    y: position.y,
    translationY: translation.y,
    velocityY: velocity.y,
    state,
  });
  return {
    position,
    translation,
    velocity,
    state,
    gestureHandler,
  };
};

export const usePanGestureHandler = () => useConst(() => panGestureHandler());

export const snapPoint = (
  value: Animated.Adaptable<number>,
  velocity: Animated.Adaptable<number>,
  points: Animated.Adaptable<number>[]
) => {
  const point = add(value, multiply(0.2, velocity));
  const diffPoint = (p: Animated.Adaptable<number>) => abs(sub(point, p));

  const deltas = points.map((p) => diffPoint(p));
  // @ts-ignore
  const minDelta = min(...deltas);
  return points.reduce(
    (acc, p) => cond(eq(diffPoint(p), minDelta), p, acc),
    new Value()
  ) as Animated.Node<number>;
};
