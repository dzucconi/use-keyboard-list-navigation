import { renderHook, act } from "@testing-library/react-hooks";
import { fireEvent } from "@testing-library/react";
import {
  useKeyboardListNavigation,
  mapCursorToList
} from "./useKeyboardListNavigation";

describe("useKeyboardListNavigation", () => {
  const list = ["first", "second", "third", "fourth"];
  const noop = () => {};

  it("selects the first element", () => {
    const { result } = renderHook(() =>
      useKeyboardListNavigation({ list, onEnter: noop })
    );

    expect(result.current.cursor).toBe(0);
    expect(result.current.index).toBe(0);
    expect(result.current.selected).toBe("first");
  });

  it('selects the second element when the "ArrowDown" key is pressed', () => {
    const { result } = renderHook(() =>
      useKeyboardListNavigation({ list, onEnter: noop })
    );

    expect(result.current.cursor).toBe(0);
    expect(result.current.index).toBe(0);
    expect(result.current.selected).toBe("first");

    act(() => {
      fireEvent.keyDown(window, { key: "ArrowDown" });
    });

    expect(result.current.cursor).toBe(1);
    expect(result.current.index).toBe(1);
    expect(result.current.selected).toBe("second");
  });

  it('selects the third element when the "ArrowDown" key is pressed twice', () => {
    const { result } = renderHook(() =>
      useKeyboardListNavigation({ list, onEnter: noop })
    );

    expect(result.current.cursor).toBe(0);
    expect(result.current.index).toBe(0);
    expect(result.current.selected).toBe("first");

    act(() => {
      fireEvent.keyDown(window, { key: "ArrowDown" });
      fireEvent.keyDown(window, { key: "ArrowDown" });
    });

    expect(result.current.cursor).toBe(2);
    expect(result.current.index).toBe(2);
    expect(result.current.selected).toBe("third");
  });

  it('selects the last element when the "ArrowUp" key is pressed initially', () => {
    const { result } = renderHook(() =>
      useKeyboardListNavigation({ list, onEnter: noop })
    );

    expect(result.current.cursor).toBe(0);
    expect(result.current.index).toBe(0);
    expect(result.current.selected).toBe("first");

    act(() => {
      fireEvent.keyDown(window, { key: "ArrowUp" });
    });

    expect(result.current.cursor).toBe(-1);
    expect(result.current.index).toBe(3);
    expect(result.current.selected).toBe("fourth");
  });

  it('calls `onEnter` with the selected items when the "Enter" key is pressed', () => {
    const onEnter = jest.fn();
    renderHook(() => useKeyboardListNavigation({ list, onEnter }));

    act(() => {
      fireEvent.keyDown(window, { key: "Enter" });
    });

    expect(onEnter).toBeCalledTimes(1);
    expect(onEnter).toHaveBeenLastCalledWith("first", {
      cursor: 0,
      interactive: false
    });

    act(() => {
      fireEvent.keyDown(window, { key: "ArrowDown" });
      fireEvent.keyDown(window, { key: "ArrowDown" });
    });

    act(() => {
      fireEvent.keyDown(window, { key: "Enter" });
    });

    expect(onEnter).toBeCalledTimes(2);
    expect(onEnter).toHaveBeenLastCalledWith("third", {
      cursor: 2,
      interactive: true
    });
  });

  describe("waitForInteractive", () => {
    it("returns an invalid index until some interaction takes place", () => {
      const { result } = renderHook(() =>
        useKeyboardListNavigation({
          list,
          onEnter: noop,
          waitForInteractive: true
        })
      );

      expect(result.current.cursor).toBe(0);
      expect(result.current.index).toBe(-1);
      expect(result.current.selected).toBeUndefined();

      act(() => {
        fireEvent.keyDown(window, { key: "ArrowDown" });
      });

      expect(result.current.cursor).toBe(0);
      expect(result.current.index).toBe(0);
      expect(result.current.selected).toEqual("first");
    });
  });
});

describe("mapCursorToList", () => {
  const LIST_LENGTH = 10;

  it("maps the range of integers correctly", () => {
    const range = [
      -10,
      -9,
      -8,
      -7,
      -6,
      -5,
      -4,
      -3,
      -2,
      -1,
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20
    ];

    expect(
      range.map(integer => mapCursorToList(integer, LIST_LENGTH))
    ).toStrictEqual([
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      0
    ]);
  });
});
