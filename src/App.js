import React from 'react'
import { rootNode, useAppModel } from './main'

function NodeTitle({ title, effects }) {
  return (
    <div className="pa3" tabIndex={0} onClick={effects.appendChild}>
      {title}
    </div>
  )
}

function NodeList({ nodes, effects }) {
  return (
    <>
      {nodes.map(node => (
        <Node key={node.id} node={node} effects={effects} />
      ))}
    </>
  )
}

function Node({ node, effects }) {
  return (
    <div className="">
      <NodeTitle title={node.title} effects={effects} />
      <div className="pl3">
        <div className="pl3">
          <NodeList nodes={node.children} effects={effects} />
        </div>
      </div>
    </div>
  )
}

function App() {
  const [model, effects] = useAppModel()

  return (
    <div className="">
      <div className="" onClick={() => effects.setRootLabel()}>
        <Node node={rootNode(model)} effects={effects} />
      </div>
    </div>
  )
}

export default App
