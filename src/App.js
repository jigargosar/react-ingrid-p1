import React, { useMemo, useState } from 'react'
import * as R from 'ramda'

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

function Node({ node }) {
  return <div className="">{node.title}</div>
}

function App() {
  const [model, setModel] = useState(() => ({
    root: { title: 'Root', children: [] },
  }))

  const effects = useEffects(setModel)

  return (
    <div className="">
      <div className="" onClick={effects.log}>
        <Node node={model.root} />
      </div>
    </div>
  )
}

export default App
