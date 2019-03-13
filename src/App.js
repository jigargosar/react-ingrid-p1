import React, { useState } from 'react'

function App() {
  const [state, setState] = useState(() => ({
    tree: { datum: 'Root', children: [] },
  }))

  return (
    <div className="">
      <div className="">{state.tree.datum}</div>
    </div>
  )
}

export default App
