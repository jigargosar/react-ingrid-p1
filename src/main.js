import { useEffect, useMemo, useState } from 'react'
import { getCached, setCache } from './cache-helpers'
import validate from 'aproba'
import * as Zipper from './TreeZipper'
import isHotKey from 'is-hotkey'
import {
  append,
  assoc,
  compose,
  cond,
  defaultTo,
  identity,
  ifElse,
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

function useEffects(setModel) {
  return useMemo(() => {
    function updateZipper(uFn) {
      setModel(overZipper(uFn))
    }

    return {
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
        const tree = LineTree.newLine()

        return updateZipper(
          ifElse(
            Zipper.isRoot,
            Zipper.appendChildGoR(tree),
            Zipper.appendGoR(tree),
          ),
        )
      },
      startEditMode() {
        setModel(m => {
          const nm = assoc('editMode', true, m)
          console.log(`m, nm`, m, nm)
          return nm
        })
      },
      stopEditMode() {
        setModel(assoc('editMode', false))
      },
      onTitleChange(newTitle) {
        updateZipper(LineZipper.setTitle(newTitle))
      },
    }
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

  useEffect(() => {
    setCache('app-model', model)
    window.m = model
  }, [model])

  useEffect(() => {
    function listener(e) {
      validate('O', arguments)
      // console.log(`e`, e)
      const keyMap = [
        ['down', effects.next],
        ['up', effects.prev],
        ['left', effects.collapseOrParent],
        ['right', effects.expandOrNext],
        ['tab', effects.indent],
        ['shift+tab', effects.outdent],
        ['cmd+up', effects.moveL],
        ['cmd+down', effects.moveR],
        ['space', effects.startEditMode],
        [['cmd+enter', 'esc'], effects.stopEditMode],
      ]

      createHotKeyHandler(keyMap)(e)
    }

    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [])

  const effects = useEffects(setModel)
  return [model, effects]
}

export function getSelectedId(model) {
  return compose(
    prop('id'),
    Zipper.datum,
  )(model.zipper)
}
