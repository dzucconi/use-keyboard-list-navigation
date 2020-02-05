# use-keyboard-list-navigation

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) [![npm](https://img.shields.io/npm/v/use-keyboard-list-navigation)](https://www.npmjs.com/package/use-keyboard-list-navigation) [![Build Status](https://travis-ci.org/dzucconi/use-keyboard-list-navigation.svg?branch=master)](https://travis-ci.org/dzucconi/use-keyboard-list-navigation)

## What is this?

A React hook to navigate through lists with your keyboard.

## Installation

```bash
yarn add use-keyboard-list-navigation
```

## Usage

```javascript
import React from "react";
import { useKeyboardListNavigation } from "use-keyboard-list-navigation";

const App: React.FC = () => {
  const list = ['one', 'two', 'three'];

  const { index, cursor, interactive, selected } = useKeyboardListNavigation({
    list, onEnter: console.log.bind(console)
  });

  return (
    <pre>
      <code>{JSON.stringify({ index, cursor, interactive, selected })}</code>
    </pre>
  );
};
```

## Interface

```typescript
const useKeyboardListNavigation: <T>({ list, onEnter, waitForInteractive }: {
  list: T[];
  onEnter(element: T, state: State): void;
  waitForInteractive?: boolean | undefined;
}) => {
  index: number;
  selected: T;
  cursor: number;
  interactive: boolean;
}
```
