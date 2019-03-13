import React from 'react'
import { useAppModel } from './main'
import validate from 'aproba'
import * as Zipper from './tree-zipper'
import * as Tree from './tree'
import * as R from 'ramda'

// function RootTree({ model, effects }) {
//   function renderTitle(node) {
//     validate('O', arguments)
//     return (
//       <div
//         className="pa2"
//         tabIndex={0}
//         onClick={() => effects.newLine(node.id)}
//       >
//         {node.title}
//       </div>
//     )
//   }
//
//   function renderNodeTree(level, id) {
//     validate('NS', arguments)
//     const node = nodeById(id, model)
//     return [
//       <div key={id} style={{ paddingLeft: `${level * 1.5}rem` }}>
//         {renderTitle(node)}
//       </div>,
//       ...node.childIds.map(cid => renderNodeTree(level + 1, cid)),
//     ]
//   }
//
//   return renderNodeTree(0, model.rootId)
// }

function RootZipper({ model, effects }) {
  const selectedId = R.compose(
    R.prop('id'),
    Zipper.datum,
  )(model.zipper)

  function renderTitle(node) {
    validate('O', arguments)
    const isSelected = selectedId === node.id
    return (
      <div
        className={`pa2 ${isSelected ? 'bg-light-blue white' : ''}`}
        tabIndex={0}
        // onClick={() => effects.newLineZ(node.id)}
      >
        {node.title}
      </div>
    )
  }

  function renderNodeTree(level, tree) {
    validate('NO', arguments)
    const node = Tree.datum(tree)
    return [
      <div key={node.id} style={{ paddingLeft: `${level * 1.5}rem` }}>
        {renderTitle(node)}
      </div>,
      ...Tree.children(tree).map(childNode =>
        renderNodeTree(level + 1, childNode),
      ),
    ]
  }

  return renderNodeTree(
    0,
    R.compose(
      Zipper.tree,
      Zipper.root,
    )(model.zipper),
  )
}

function App() {
  const [model, effects] = useAppModel()

  return (
    <div className="">
      {/*<RootTree model={model} effects={effects} />*/}
      <RootZipper model={model} effects={effects} />
    </div>
  )
}

export default App
