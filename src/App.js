import React, { useMemo, useState } from 'react'
import * as R from 'ramda'
import validate from 'aproba'

function useEffects(setState) {
  return useMemo(
    () => ({
      log: msg => console.log(msg),
      setRootLabel: () =>
        setState(R.assocPath(['root', 'title'])('Root1')),
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

function App() {
  const [model, setModel] = useState(() => {
    const rootId = 'n_root'
    const root = { id: rootId, title: 'Root', childIds: [] }
    return {
      rootId,
      byId: { [root.id]: root },
    }
  })

  const effects = useEffects(setModel)

  return (
    <div className="">
      <div className="" onClick={effects.log}>
        <Node node={rootNode(model)} />
      </div>
    </div>
  )
}

export default App
