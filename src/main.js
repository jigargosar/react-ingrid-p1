import { useEffect, useMemo, useState } from 'react'
import * as R from 'ramda'
import { getCached, setCache } from './cache-helpers'
import validate from 'aproba'

function useEffects(setState) {
  return useMemo(
    () => ({
      log: msg => console.log(msg),
      setRootLabel: () =>
        setState(state =>
          R.assocPath(['byId', state.rootId, 'title'])('Root1')(state),
        ),
    }),
    [],
  )
}

export function rootNode(model) {
  validate('O', arguments)
  return model.byId[model.rootId]
}

export function useAppModel() {
  const [model, setModel] = useState(() => {
    const rootId = 'n_root'
    const root = { id: rootId, title: 'Root', children: [] }

    const def = { byId: { [root.id]: root }, rootId }

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
