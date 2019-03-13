import { useEffect, useMemo, useState } from 'react'
import * as R from 'ramda'
import { getCached, setCache } from './cache-helpers'
import validate from 'aproba'
import nanoid from 'nanoid'

function useEffects(setModel) {
  return useMemo(
    () => ({
      log: msg => console.log(msg),
      setRootLabel: () =>
        setModel(state => R.assocPath(['root', 'title'])('Root1')(state)),

      appendChild: parentId =>
        setModel(model =>
          R.over(
            R.lensPath(['byId', parentId, 'children']),
            R.append({
              id: `n_${nanoid()}`,
              title: 'foo',
              children: [],
            }),
          )(model),
        ),
    }),
    [],
  )
}

export function rootNode(model) {
  validate('O', arguments)
  return R.path(['byId', model.rootId])(model)
}

export function useAppModel() {
  const [model, setModel] = useState(() => {
    const rootId = 'n_root'
    const root = {
      id: rootId,
      title: 'Root',
      children: [],
      cursor: [rootId],
    }

    const def = {
      root,
      byId: { [root.id]: root },
      rootId,
      selectedId: root.id,
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

  const effects = useEffects(setModel)
  return [model, effects]
}
