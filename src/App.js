import React from 'react'
import {
  canCollapseTree,
  canExpandTree,
  getSelectedId,
  useAppModel,
} from './main'
import validate from 'aproba'
import * as Zipper from './TreeZipper'
import * as Tree from './Tree'
import * as R from 'ramda'
import { always, cond, T } from 'ramda'

function treeId(tree) {
  validate('O', arguments)
  return Tree.datum(tree).id
}

function treeIdEq(id, tree) {
  validate('SO', arguments)
  return Tree.datum(tree).id === id
}

function treeTitle(tree) {
  validate('O', arguments)
  return Tree.datum(tree).title
}

function treeExpandIcon(tree) {
  validate('O', arguments)
  return cond([
    [canExpandTree, always('+')],
    [canCollapseTree, always('-')],
    [T, always(' ')],
  ])(tree)
}

function RootZipper({ model, effects }) {
  const selectedId = getSelectedId(model)

  function renderTitleLine(tree) {
    validate('O', arguments)
    const isSelected = treeIdEq(selectedId, tree)
    return (
      <div className="flex code">
        <div className="ph2 flex items-center w1">
          {treeExpandIcon(tree)}
        </div>
        <div
          className={`pa2 ${isSelected ? 'bg-light-blue white' : ''}`}
          // tabIndex={isSelected ? 0 : null}
          // onClick={() => effects.newLineZ(node.id)}
        >
          {treeTitle(tree)}
        </div>
      </div>
    )
  }

  function renderNodeTree(level, tree) {
    validate('NO', arguments)
    return [
      <div key={treeId(tree)} style={{ paddingLeft: `${level * 1.5}rem` }}>
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
