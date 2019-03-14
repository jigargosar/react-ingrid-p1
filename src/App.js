import React from 'react'
import { getSelectedId, useAppModel } from './main'
import validate from 'aproba'
import * as Zipper from './TreeZipper'
import * as Tree from './Tree'
import * as R from 'ramda'
import * as LineTree from './LineTree'

function RootZipper({ model }) {
  const selectedId = getSelectedId(model)

  function renderTitleLine(tree) {
    validate('O', arguments)
    const isSelected = LineTree.treeIdEq(selectedId, tree)
    return (
      <div className="flex code">
        <div className="ph2 flex items-center w1">
          {LineTree.expandIcon(tree)}
        </div>
        <div
          className={`pa2 ${isSelected ? 'bg-light-blue white' : ''}`}
          // tabIndex={isSelected ? 0 : null}
          // onClick={() => effects.newLineZ(node.id)}
        >
          {LineTree.title(tree)}
        </div>
      </div>
    )
  }

  function renderNodeTree(level, tree) {
    validate('NO', arguments)
    return [
      <div
        key={LineTree.id(tree)}
        style={{ paddingLeft: `${level * 1.5}rem` }}
      >
        {renderTitleLine(tree)}
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
