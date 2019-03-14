import React from 'react'
import { getSelectedId, useAppModel } from './main'
import validate from 'aproba'
import * as Zipper from './TreeZipper'
import * as R from 'ramda'
import * as LineTree from './LineTree'

function TitleLine({ tree, isSelected }) {
  return (
    <div className="flex code ph2">
      <div className=" flex items-center w1">
        {LineTree.expandIcon(tree)}
      </div>
      <div
        className={`br1 lh-copy ph2 ${
          isSelected ? 'bg-light-blue white' : ''
        }`}
        // tabIndex={isSelected ? 0 : null}
        // onClick={() => effects.newLineZ(node.id)}
      >
        {LineTree.title(tree)}
      </div>
    </div>
  )
}

function RootZipper({ model }) {
  const selectedId = getSelectedId(model)

  function renderNodeTree(level, tree) {
    validate('NO', arguments)
    return [
      <div
        key={LineTree.id(tree)}
        style={{ paddingLeft: `${level * 1.5}rem` }}
      >
        <TitleLine
          {...{
            tree,
            isSelected: LineTree.treeIdEq(selectedId, tree),
          }}
        />
      </div>,
      ...LineTree.visibleChildren(tree).map(childNode =>
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
