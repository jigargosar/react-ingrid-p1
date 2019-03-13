import React, { useEffect, useMemo, useState } from 'react'
import * as R from 'ramda'
import validate from 'aproba'
import { getCached, setCache } from './cache-helpers'

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

function rootNode(model) {
  validate('O', arguments)
  return model.byId[model.rootId]
}

function Node({ node }) {
  return <div className="">{node.title}</div>
}

function useAppModel() {
  const [model, setModel] = useState(() => {
    const rootId = 'n_root'
    const root = { id: rootId, title: 'Root', childIds: [] }

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

function App() {
  const [model, effects] = useAppModel()

  return (
    <div className="">
      <div className="" onClick={() => effects.setRootLabel()}>
        <Node node={rootNode(model)} />
      </div>
    </div>
  )
}

export default App
