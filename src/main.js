import { useEffect, useMemo, useState } from 'react'
import * as R from 'ramda'
import { getCached, setCache } from './cache-helpers'
import validate from 'aproba'
import nanoid from 'nanoid'
import faker from 'faker'
import * as Tree from './tree'
import * as Zipper from './tree-zipper'

function appendChild(parentId) {
  const node = {
    id: `n_${nanoid()}`,
    title: faker.name.lastName(),
    childIds: [],
  }
  return R.compose(
    R.assocPath(['byId', node.id])(node),
    R.over(R.lensPath(['byId', parentId, 'childIds']), R.append(node.id)),
  )
}

function useEffects(setModel) {
  return useMemo(
    () => ({
      log: msg => console.log(msg),
      newLine: parentId => setModel(model => appendChild(parentId)(model)),
      newLineZ: () => {
        const node = {
          id: `n_${nanoid()}`,
          title: faker.name.lastName(),
          childIds: [],
        }
        const tree = Tree.fromDatum(node)
        return setModel(
          R.over(R.lensPath(['zipper']))(
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
    }
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [])

  const effects = useEffects(setModel)
  return [model, effects]
}
