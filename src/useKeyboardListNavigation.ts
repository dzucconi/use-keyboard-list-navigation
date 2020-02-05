import { useCallback, useEffect, useReducer, useMemo } from "react";

export const mapCursorToList = (counter: number, max: number) => {
  if (max === 0) return 0;
  if (counter >= 0) return counter % max;
  const modulo = counter % max;
  if (modulo === 0) return Math.abs(modulo); // -0
  return modulo + max;
};

export type Action =
  | { type: "RESET" }
  | { type: "INTERACT" }
  | { type: "PREV" }
  | { type: "NEXT" };

export interface State {
  cursor: number;
  interactive: boolean;
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "RESET":
      return { ...state, cursor: 0, interactive: false };
    case "INTERACT":
      return { ...state, interactive: true };
    case "PREV":
      return { ...state, cursor: state.cursor - 1, interactive: true };
    case "NEXT":
      return { ...state, cursor: state.cursor + 1, interactive: true };
  }
};

export const useKeyboardListNavigation = <T>({
  list,
  onEnter,
  waitForInteractive = false
}: {
  list: T[];
  onEnter(element: T, state: State): void;
  waitForInteractive?: boolean;
}) => {
  const [state, dispatch] = useReducer(reducer, {
    cursor: 0,
    interactive: false
  });

  const index = mapCursorToList(state.cursor, list.length);

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
          return onEnter(list[index], state);
        }
        default:
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
