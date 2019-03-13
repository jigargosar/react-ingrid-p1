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

      appendChild: () =>
        setModel(
          R.over(
            R.lensPath(['root', 'children']),
            R.append({
              id: `n_${nanoid()}`,
              title: 'foo',
              children: [],
            }),
          ),
        ),
    }),
    [],
  )
}

export function rootNode(model) {
  validate('O', arguments)
  return R.prop('root')(model)
}

export function useAppModel() {
  const [model, setModel] = useState(() => {
    const rootId = 'n_root'
    const root = { id: rootId, title: 'Root', children: [] }

    const def = { root }

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
