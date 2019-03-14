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
      log: msg => console.log(msg),

      next() {
        updateZipper(
          Zipper.withRollback(
            Zipper.findNext(LineZipper.allAncestorsExpanded),
          ),
        )
      },
      prev() {
        updateZipper(
          Zipper.withRollback(
            Zipper.findPrev(LineZipper.allAncestorsExpanded),
          ),
        )
      },
      collapseOrPrev() {
        updateZipper(ifElse(LineZipper.canCollapse, LineZipper.collapse))
      },
      expandOrNext() {
        updateZipper(Zipper.mapDatum(assoc('collapsed', false)))
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

export function useAppModel() {
  const [model, setModel] = useState(() => {
    const def = {
      zipper: LineZipper.initial,
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
  }, [model])

  useEffect(() => {
    function listener(e) {
      validate('O', arguments)
      // console.log(`e`, e)
      const keyMap = [
        ['down', effects.next],
        ['up', effects.prev],
        ['left', effects.collapseOrPrev],
        ['right', effects.expandOrNext],
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
