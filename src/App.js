import React from 'react'
import { nodeById, useAppModel } from './main'
import validate from 'aproba'

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
