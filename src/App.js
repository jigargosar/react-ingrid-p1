import React from 'react'
import { rootNode, useAppModel } from './main'

function NodeTitle({ title }) {
  return (
    <div className="pa3" tabIndex={0}>
      {title}
    </div>
  )
}

function NodeList({ nodes }) {
  return (
    <>
      {nodes.forEach(node => (
        <Node key={node.id} node={node} />
      ))}
    </>
  )
}

function Node({ node }) {
  return (
    <div className="">
      <NodeTitle title={node.title} />
      <div className="pa3">
        <div className="pl3">Children</div>
        <NodeList nodes={node.children} />
      </div>
    </div>
  )
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
