import { renderHook, act } from "@testing-library/react-hooks";
import { fireEvent } from "@testing-library/react";
import { useKeyboardListNavigation } from "./useKeyboardListNavigation";

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

  it('selects the last element when the "End" key is pressed no matter where in the list one is', () => {
    const { result } = renderHook(() =>
      useKeyboardListNavigation({ list, onEnter: noop })
    );

    expect(result.current.cursor).toBe(0);
    expect(result.current.index).toBe(0);
    expect(result.current.selected).toBe("first");

    act(() => {
      fireEvent.keyDown(window, { key: "End" });
    });

    expect(result.current.cursor).toBe(3);
    expect(result.current.index).toBe(3);
    expect(result.current.selected).toBe("fourth");

    act(() => {
      fireEvent.keyDown(window, { key: "ArrowUp" });
      fireEvent.keyDown(window, { key: "ArrowUp" });
    });

    expect(result.current.cursor).toBe(1);
    expect(result.current.index).toBe(1);
    expect(result.current.selected).toBe("second");

    act(() => {
      fireEvent.keyDown(window, { key: "End" });
    });

    expect(result.current.cursor).toBe(3);
    expect(result.current.index).toBe(3);
    expect(result.current.selected).toBe("fourth");
  });

  it('selects the first element when the "Home" key is pressed no matter where in the list one is', () => {
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
      fireEvent.keyDown(window, { key: "Home" });
    });

    expect(result.current.cursor).toBe(0);
    expect(result.current.index).toBe(0);
    expect(result.current.selected).toBe("first");

    act(() => {
      fireEvent.keyDown(window, { key: "ArrowUp" });
      fireEvent.keyDown(window, { key: "ArrowUp" });
    });

    expect(result.current.cursor).toBe(-2);
    expect(result.current.index).toBe(2);
    expect(result.current.selected).toBe("third");

    act(() => {
      fireEvent.keyDown(window, { key: "Home" });
    });

    expect(result.current.cursor).toBe(0);
    expect(result.current.index).toBe(0);
    expect(result.current.selected).toBe("first");
  });

  it("selects the third item when the t key is pressed", () => {
    const { result } = renderHook(() =>
      useKeyboardListNavigation({
        list,
        onEnter: noop
      })
    );

    expect(result.current.cursor).toBe(0);
    expect(result.current.index).toBe(0);
    expect(result.current.selected).toBe("first");

    act(() => {
      fireEvent.keyDown(window, { key: "t" });
    });

    expect(result.current.cursor).toBe(2);
    expect(result.current.index).toBe(2);
    expect(result.current.selected).toBe("third");

    act(() => {
      fireEvent.keyDown(window, { key: "s" });
    });

    expect(result.current.cursor).toBe(1);
    expect(result.current.index).toBe(1);
    expect(result.current.selected).toBe("second");
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
      length: 4,
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
      length: 4,
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
