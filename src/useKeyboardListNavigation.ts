import { useCallback, useEffect, useReducer } from "react";
import { mapCursorToMax } from "map-cursor-to-max";

export type UseKeyboardListNavigationAction =
  | { type: "RESET" }
  | { type: "INTERACT" }
  | { type: "PREV" }
  | { type: "NEXT" }
  | { type: "FIRST" }
  | { type: "LAST" }
  | { type: "SET"; payload: { cursor: number } };

export type UseKeyboardListNavigationState = {
  cursor: number;
  length: number;
  interactive: boolean;
};

const reducer = (
  state: UseKeyboardListNavigationState,
  action: UseKeyboardListNavigationAction
): UseKeyboardListNavigationState => {
  switch (action.type) {
    case "RESET":
      return { ...state, cursor: 0, interactive: false };
    case "INTERACT":
      return { ...state, interactive: true };
    case "PREV":
      return { ...state, cursor: state.cursor - 1, interactive: true };
    case "NEXT":
      return { ...state, cursor: state.cursor + 1, interactive: true };
    case "FIRST":
      return { ...state, cursor: 0, interactive: true };
    case "LAST":
      return { ...state, cursor: state.length - 1, interactive: true };
    case "SET":
      return { ...state, cursor: action.payload.cursor };
  }
};

export const useKeyboardListNavigation = <T>({
  list,
  onEnter,
  waitForInteractive = false
}: {
  list: T[];
  onEnter(
    element: T,
    state: UseKeyboardListNavigationState,
    index: number
  ): void;
  waitForInteractive?: boolean;
}) => {
  const [state, dispatch] = useReducer(reducer, {
    cursor: 0,
    length: list.length,
    interactive: false
  });

  const index = mapCursorToMax(state.cursor, list.length);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowUp": {
          event.preventDefault();
          return dispatch({ type: "PREV" });
        }
        case "ArrowDown": {
          event.preventDefault();
          if (waitForInteractive && !state.interactive)
            return dispatch({ type: "INTERACT" });
          return dispatch({ type: "NEXT" });
        }
        case "Enter": {
          return onEnter(list[index], state, index);
        }
        case "Home": {
          return dispatch({ type: "FIRST" });
        }
        case "End": {
          return dispatch({ type: "LAST" });
        }
        default:
          // Set focus based on first character
          if (/^[a-z0-9_-]$/i.test(event.key)) {
            const node = list.find(
              item =>
                typeof item === "string" &&
                item.toLowerCase().startsWith(event.key)
            );

            if (node) {
              dispatch({
                type: "SET",
                payload: { cursor: list.indexOf(node) }
              });
            }
          }

          break;
      }
    },
    [index, list, onEnter, state, waitForInteractive]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => dispatch({ type: "RESET" }), [list.length]);

  const interactiveIndex =
    waitForInteractive && !state.interactive ? -1 : index;

  return {
    ...state,
    index: interactiveIndex,
    selected: list[interactiveIndex]
  };
};
