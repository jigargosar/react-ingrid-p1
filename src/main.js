import { useEffect, useMemo, useState } from 'react'
import { getCached, setCache } from './cache-helpers'
import validate from 'aproba'
import nanoid from 'nanoid'
import faker from 'faker'
import * as Tree from './Tree'
import * as Zipper from './TreeZipper'
import isHotKey from 'is-hotkey'
import {
  assoc,
  compose,
  defaultTo,
  ifElse,
  lensPath,
  mergeDeepRight,
  over,
  prop,
} from 'ramda'
import * as LineZipper from './LineZipper'

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
          Zipper.withRollback(Zipper.findNext(LineZipper.isVisible)),
        )
      },
      prev() {
        updateZipper(
          Zipper.withRollback(Zipper.findPrev(LineZipper.isVisible)),
        )
      },
      collapseOrPrev() {
        updateZipper(Zipper.mapDatum(assoc('collapsed', true)))
      },
      expandOrNext() {
        updateZipper(Zipper.mapDatum(assoc('collapsed', false)))
      },
      newLineZ: () => {
        const node = {
          id: `n_${nanoid()}`,
          title: faker.name.lastName(),
          collapsed: false,
          childIds: [],
        }
        const tree = Tree.fromDatum(node)

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
      console.log(`e`, e)
      if (isHotKey('down')(e)) {
        e.preventDefault()
        effects.next()
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
        effects.newLineZ()
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
