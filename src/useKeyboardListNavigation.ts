import { useCallback, useEffect, useReducer, useRef } from "react";
import { mapCursorToMax } from "map-cursor-to-max";

export type UseKeyboardListNavigationAction =
  | { type: "RESET" }
  | { type: "INTERACT" }
  | { type: "PREV" }
  | { type: "NEXT" }
  | { type: "FIRST" }
  | { type: "LAST" }
  | { type: "SET"; payload: { cursor?: number; interactive?: boolean } };

export type UseKeyboardListNavigationState = {
  cursor: number;
  length: number;
  interactive: boolean;
};

const reducer =
  (defaults: { cursor: number }) =>
  (
    state: UseKeyboardListNavigationState,
    action: UseKeyboardListNavigationAction
  ): UseKeyboardListNavigationState => {
    switch (action.type) {
      case "RESET":
        return { ...state, interactive: false, cursor: defaults.cursor };
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
        return { ...state, ...action.payload };
    }
  };

export type UseKeyboardListNavigationProps<T> = {
  ref?: React.MutableRefObject<any>;
  list: T[];
  waitForInteractive?: boolean;
  defaultValue?: T;
  bindAxis?: "vertical" | "horizontal" | "both";
  onEnter({
    event,
    element,
    state,
    index,
  }: {
    event: KeyboardEvent;
    element: T;
    state: UseKeyboardListNavigationState;
    index: number;
  }): void;
  extractValue?(item: T): string;
};

const IDLE_TIMEOUT_MS = 1000;

export const useKeyboardListNavigation = <T>({
  ref,
  list,
  waitForInteractive = false,
  defaultValue,
  bindAxis = "vertical",
  onEnter,
  extractValue = (item) => (typeof item === "string" ? item.toLowerCase() : ""),
}: UseKeyboardListNavigationProps<T>) => {
  const defaultCursor = defaultValue ? list.indexOf(defaultValue) : 0;
  const [state, dispatch] = useReducer(reducer({ cursor: defaultCursor }), {
    cursor: defaultCursor,
    length: list.length,
    interactive: false,
  });

  const searchTerm = useRef("");
  const idleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const index = mapCursorToMax(state.cursor, list.length);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const handleUp = () => {
        event.preventDefault();
        return dispatch({ type: "PREV" });
      };

      const handleDown = () => {
        event.preventDefault();
        if (waitForInteractive && !state.interactive) {
          return dispatch({ type: "INTERACT" });
        }
        return dispatch({ type: "NEXT" });
      };

      switch (event.key) {
        case "ArrowUp": {
          if (bindAxis === "horizontal") return;
          return handleUp();
        }
        case "ArrowDown": {
          if (bindAxis === "horizontal") return;
          return handleDown();
        }
        case "ArrowLeft": {
          if (bindAxis === "vertical") return;
          return handleUp();
        }
        case "ArrowRight": {
          if (bindAxis === "vertical") return;
          return handleDown();
        }
        case "Enter": {
          return onEnter({ event, element: list[index], state, index });
        }
        case "Home": {
          return dispatch({ type: "FIRST" });
        }
        case "End": {
          return dispatch({ type: "LAST" });
        }
        default:
          // Set focus based on search term
          if (/^[a-z0-9_-]$/i.test(event.key)) {
            searchTerm.current = `${searchTerm.current}${event.key}`;

            const node = list.find((item) =>
              extractValue(item).startsWith(searchTerm.current)
            );

            if (node) {
              dispatch({
                type: "SET",
                payload: { cursor: list.indexOf(node) },
              });
            }

            if (idleTimeout.current) clearTimeout(idleTimeout.current);

            idleTimeout.current = setTimeout(() => {
              searchTerm.current = "";
            }, IDLE_TIMEOUT_MS);
          }

          break;
      }
    },
    [index, list, onEnter, state, waitForInteractive, extractValue]
  );

  useEffect(() => {
    const el = ref?.current ?? window;
    el.addEventListener("keydown", handleKeyDown);
    return () => {
      el.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, ref, idleTimeout]);

  useEffect(() => dispatch({ type: "RESET" }), [list.length]);

  const interactiveIndex =
    waitForInteractive && !state.interactive ? -1 : index;

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const set = useCallback(
    (payload: { cursor?: number; interactive?: boolean }) => {
      dispatch({ type: "SET", payload });
    },
    []
  );

  return {
    ...state,
    index: interactiveIndex,
    selected: list[interactiveIndex],
    reset,
    set,
  };
};
