import React from 'react'
import { rootNode, useAppModel } from './main'

function Node({ node }) {
  return <div className="">{node.title}</div>
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
