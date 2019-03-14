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
  both,
  complement,
  compose,
  defaultTo,
  ifElse,
  lensPath,
  mergeDeepRight,
  over,
  prop,
} from 'ramda'
import { collapsedProp } from './Node'

const zipperL = lensPath(['zipper'])
const overZipper = over(zipperL)

function useEffects(setModel) {
  return useMemo(
    () => ({
      log: msg => console.log(msg),

      next() {
        setModel(overZipper(Zipper.withRollback(Zipper.next)))
      },
      prev() {
        setModel(overZipper(Zipper.withRollback(Zipper.prev)))
      },
      collapseOrPrev() {
        setModel(overZipper(Zipper.mapDatum(assoc('collapsed', true))))
      },
      expandOrNext() {
        setModel(overZipper(Zipper.mapDatum(assoc('collapsed', false))))
      },
      newLineZ: () => {
        const node = {
          id: `n_${nanoid()}`,
          title: faker.name.lastName(),
          collapsed: false,
          childIds: [],
        }
        const tree = Tree.fromDatum(node)

        return setModel(
          overZipper(
            ifElse(
              z => Zipper.root(z) === z,
              Zipper.appendChildGoR(tree),
              Zipper.appendGoR(tree),
            ),
          ),
        )
      },
    }),
    [],
  )
}

function treeCollapsedProp(tree) {
  validate('O', arguments)
  return compose(
    collapsedProp,
    Tree.datum,
  )(tree)
}

const treeHasChildrenAnd = both(Tree.hasChildren)

export function canExpandTree(tree) {
  validate('O', arguments)
  return treeHasChildrenAnd(treeCollapsedProp)(tree)
}

export function canCollapseTree(tree) {
  validate('O', arguments)
  return treeHasChildrenAnd(complement(treeCollapsedProp))(tree)
}

export function useAppModel() {
  const [model, setModel] = useState(() => {
    const root = {
      id: 'n_root',
      title: 'Root',
      childIds: [],
      collapsed: false,
    }

    const def = {
      zipper: Zipper.singleton(Tree.fromDatum(root)),
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
