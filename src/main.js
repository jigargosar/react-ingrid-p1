import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getCached, setCache } from './cache-helpers'
import validate from 'aproba'
import * as Zipper from './TreeZipper'
import isHotKey from 'is-hotkey'
import {
  always,
  append,
  assoc,
  compose,
  cond,
  defaultTo,
  equals,
  identity,
  ifElse,
  init,
  last,
  lensPath,
  map,
  mergeDeepRight,
  over,
  prop,
  T,
} from 'ramda'
import * as LineZipper from './LineZipper'
import * as LineTree from './LineTree'

const zipperL = lensPath(['zipper'])
const overZipper = over(zipperL)

const stopEditMode = assoc('editMode', false)

function newLine() {
  const tree = LineTree.newLine()
  return overZipper(
    ifElse(
      Zipper.isRoot,
      Zipper.appendChildGoR(tree),
      Zipper.appendGoR(tree),
    ),
  )
}

const startEditMode = assoc('editMode', true)

function useEffects(setModel) {
  return useMemo(() => {
    function updateZipper(uFn) {
      setModel(overZipper(uFn))
    }

    const effects = {
      next() {
        updateZipper(LineZipper.next)
      },
      prev() {
        updateZipper(LineZipper.prev)
      },
      collapseOrParent() {
        updateZipper(
          ifElse(
            LineZipper.canCollapse,
            LineZipper.collapse,
            LineZipper.parentWithRollback,
          ),
        )
      },
      expandOrNext() {
        updateZipper(
          ifElse(LineZipper.canExpand, LineZipper.expand, LineZipper.next),
        )
      },
      moveL() {
        updateZipper(LineZipper.moveL)
      },
      moveR() {
        updateZipper(LineZipper.moveR)
      },
      indent() {
        updateZipper(LineZipper.indent)
      },
      outdent() {
        updateZipper(LineZipper.outdent)
      },
      newLine: () => {
        setModel(newLine())
      },
      newLineAndStartEditing() {
        effects.newLine()
        effects.startEditMode()
      },
      newLineOrDeleteEmptyLeaf() {
        setModel(m => {
          const zipper = m.zipper
          const emptyLeaf = LineZipper.isBlankTitleLeaf(zipper)

          if (emptyLeaf) {
            return compose(
              overZipper(LineZipper.deleteBlankTitleLeaf),
              stopEditMode,
            )(m)
          } else {
            return newLine()(m)
          }
        })
      },
      deleteLine: () => {
        updateZipper(LineZipper.deleteLine)
      },
      startEditMode() {
        setModel(startEditMode)
      },
      stopEditMode() {
        setModel(stopEditMode)
      },
      onTitleChange(newTitle) {
        updateZipper(LineZipper.setTitle(newTitle))
      },
    }
    return effects
  }, [setModel])
}

const createHotKeyHandler = compose(
  cond,
  append([T, identity]),
  map(([k, f]) => [
    isHotKey(k),
    e => {
      f()
      e.preventDefault()
    },
  ]),
)

export function getIsEditMode(model) {
  validate('O', arguments)
  return model.editMode
}

export function useAppModel() {
  const [model, setModel] = useState(() => {
    const def = {
      zipper: LineZipper.initial,
      editMode: false,
    }

    return compose(
      // tap(console.log),
      mergeDeepRight(def),
      defaultTo({}),
      getCached,
    )('app-model')
  })

  const prevModelRef = useRef(model)

  const [history, setHistory] = useState([])

  useEffect(() => {
    const prevModel = prevModelRef.current
    if (!equals(prevModel.zipper, model.zipper)) {
      console.log(`history`, history)
      // console.log('zipper changed', prevModel.zipper, model.zipper)
      setHistory(append(model.zipper))
      prevModel.current = model
    }
  }, [model.zipper])

  useEffect(() => {
    setCache('app-model', model)
    window.m = model
  }, [model])

  const undoCallback = useCallback(() => {
    console.log(`undoCallback log history:`, history)
    const lastHistoryItem = last(history)
    if (lastHistoryItem) {
      setModel(overZipper(always(lastHistoryItem)))
      setHistory(init(history))
    }
  }, [history])

  useEffect(() => {
    function listener(e) {
      validate('O', arguments)
      // console.log(`e`, e)
      const normalModeKeyMap = [
        ['down', effects.next],
        ['up', effects.prev],
        ['left', effects.collapseOrParent],
        ['right', effects.expandOrNext],
        ['tab', effects.indent],
        ['shift+tab', effects.outdent],
        ['cmd+up', effects.moveL],
        ['cmd+down', effects.moveR],
        ['space', effects.startEditMode],
        ['enter', effects.newLineAndStartEditing],
        ['delete', effects.deleteLine],
        ['cmd+z', undoCallback],
      ]
      const editModeKeyMap = [
        ['tab', effects.indent],
        ['shift+tab', effects.outdent],
        [['cmd+enter', 'esc'], effects.stopEditMode],
        ['enter', effects.newLineOrDeleteEmptyLeaf],
      ]

      createHotKeyHandler(
        model.editMode ? editModeKeyMap : normalModeKeyMap,
      )(e)
    }

    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [model.editMode, undoCallback])

  const effects = useEffects(setModel)
  return [model, effects]
}

export function getSelectedId(model) {
  return compose(
    prop('id'),
    Zipper.datum,
  )(model.zipper)
}
