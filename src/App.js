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

function App() {
  const [model, setState] = useState(() => ({
    root: { title: 'Root', children: [] },
  }))

  const effects = useEffects(setState)

  return (
    <div className="">
      <div className="" onClick={effects.log}>
        {model.root.title}
      </div>
    </div>
  )
}

export default App
