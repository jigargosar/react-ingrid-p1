import React from 'react'
import { childNodes, rootNode, useAppModel } from './main'

function NodeTitle({ title, effects, id }) {
  return (
    <div
      className="pa3"
      tabIndex={0}
      onClick={() => effects.appendChild(id)}
    >
      {title}
    </div>
  )
}

function NodeList({ model, nodes, effects }) {
  return (
    <>
      {nodes.map(node => (
        <Node key={node.id} model={model} node={node} effects={effects} />
      ))}
    </>
  )
}

function Node({ model, node, effects }) {
  return (
    <div className="">
      <NodeTitle title={node.title} effects={effects} id={node.id} />
      <div className="pl3">
        <div className="pl3">
          <NodeList
            nodes={childNodes(node.id, model)}
            model={model}
            effects={effects}
          />
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
        <Node node={rootNode(model)} model={model} effects={effects} />
      </div>
    </div>
  )
}

export default App
