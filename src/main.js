import { useEffect, useMemo, useState } from 'react'
import { getCached, setCache } from './cache-helpers'
import validate from 'aproba'
import * as Zipper from './TreeZipper'
import isHotKey from 'is-hotkey'
import {
  assoc,
  compose,
  defaultTo,
  find,
  identity,
  ifElse,
  isNil,
  lensPath,
  mergeDeepRight,
  nth,
  over,
  pipe,
  prop,
  unless,
} from 'ramda'
import * as LineZipper from './LineZipper'
import * as LineTree from './LineTree'
import pipeline from 'pipeline.macro'
import { _ } from 'param.macro'

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
        updateZipper(Zipper.mapDatum(assoc('collapsed', true)))
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

      const fst = nth(0)
      const snd = nth(1)
      const handler = pipeline(
        keyMap,
        find(
          pipe(
            fst,
            isHotKey(_, e),
          ),
        ),
        unless(isNil, snd),
        defaultTo(identity),
      )

      if (isHotKey('down')(e)) {
        e.preventDefault()
        effects.next()
        console.assert(handler === effects.next)
      }
      if (isHotKey('up')(e)) {
        e.preventDefault()
        effects.prev()
      }
      if (isHotKey('left')(e)) {
        e.preventDefault()
        effects.collapseOrPrev()
      }
      if (isHotKey('right')(e)) {
        e.preventDefault()
        effects.expandOrNext()
      }
      if (isHotKey('enter')(e)) {
        e.preventDefault()
        effects.newLine()
      }
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
