import { useEffect, useMemo, useState } from 'react'
import * as R from 'ramda'
import { getCached, setCache } from './cache-helpers'
import validate from 'aproba'
import nanoid from 'nanoid'
import faker from 'faker'
import * as Tree from './tree'
import * as Zipper from './tree-zipper'
import isHotKey from 'is-hotkey'

const zipperL = R.lensPath(['zipper'])
const overZipper = R.over(zipperL)

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
      newLineZ: () => {
        const node = {
          id: `n_${nanoid()}`,
          title: faker.name.lastName(),
          childIds: [],
        }
        const tree = Tree.fromDatum(node)

        return setModel(
          overZipper(
            R.ifElse(
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

export function nodeById(id, model) {
  validate('SO', arguments)
  return R.path(['byId', id])(model)
}

export function useAppModel() {
  const [model, setModel] = useState(() => {
    const rootId = 'n_root'
    const root = {
      id: rootId,
      title: 'Root',
      childIds: [],
    }

    const def = {
      byId: { [root.id]: root },
      rootId,
      zipper: Zipper.singleton(Tree.fromDatum(root)),
    }

    return R.compose(
      // R.tap(console.log),
      R.mergeDeepRight(def),
      R.defaultTo({}),
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
