import { useRef } from "react";
import Animated from "react-native-reanimated";
import { State } from "react-native-gesture-handler";
const { divide, sub, Value, event, multiply, add, min, abs, cond, eq } = Animated;
export const translateZ = (perspective, z) => ({ scale: divide(perspective, sub(perspective, z)) });
function useConst(initialValue) {
    const ref = useRef();
    if (ref.current === undefined) {
        // Box the value in an object so we can tell if it's initialized even if the initializer
        // returns/is undefined
        ref.current = {
            value: typeof initialValue === "function"
                ? // eslint-disable-next-line @typescript-eslint/ban-types
                    initialValue()
                : initialValue,
        };
    }
    return ref.current.value;
}
const create = (x, y) => ({
    x: x ?? 0,
    y: y ?? x ?? 0,
});
const createValue = (x = 0, y) => create(new Value(x), new Value(y ?? x));
const onGestureEvent = (nativeEvent) => {
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
export const snapPoint = (value, velocity, points) => {
    const point = add(value, multiply(0.2, velocity));
    const diffPoint = (p) => abs(sub(point, p));
    const deltas = points.map((p) => diffPoint(p));
    // @ts-ignore
    const minDelta = min(...deltas);
    return points.reduce((acc, p) => cond(eq(diffPoint(p), minDelta), p, acc), new Value());
};
