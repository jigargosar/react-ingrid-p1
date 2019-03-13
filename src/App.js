import React from 'react'
import { childNodes, nodeById, useAppModel } from './main'
import validate from 'aproba'

function NodeTitle({ title, effects, id }) {
  return (
    <div className="pa3" tabIndex={0} onClick={() => effects.newLine(id)}>
      {title}
    </div>
  )
}

function Node({ model, node, effects }) {
  return (
    <div className="">
      <NodeTitle title={node.title} effects={effects} id={node.id} />
      <div className="pl3">
        <div className="pl3">
          {childNodes(node.id, model).map(node => (
            <Node
              key={node.id}
              model={model}
              node={node}
              effects={effects}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function RootTree({ model, effects }) {
  function renderTitle(node) {
    validate('O', arguments)
    return (
      <div
        className="pa2"
        tabIndex={0}
        onClick={() => effects.newLine(node.id)}
      >
        {node.title}
      </div>
    )
  }

  function renderNodeTree(level, id) {
    validate('NS', arguments)
    const node = nodeById(id, model)
    return [
      <div key={id} style={{ paddingLeft: `${level * 1.5}rem` }}>
        {renderTitle(node)}
      </div>,
      ...node.childIds.map(cid => renderNodeTree(level + 1, cid)),
    ]
  }

  return renderNodeTree(0, model.rootId)
}

function App() {
  const [model, effects] = useAppModel()

  return (
    <div className="">
      <RootTree model={model} effects={effects} />
    </div>
  )
}

export default App
