import React, { useEffect, useRef } from 'react'
import { getSelectedId, useAppModel } from './main'
import * as Zipper from './TreeZipper'
import * as R from 'ramda'
import * as LineTree from './LineTree'

function TitleLine({ title, icon, isSelected }) {
  const titleRef = useRef()

  useEffect(() => {
    const el = titleRef.current
    if (el && isSelected) {
      el.focus()
    }
  }, [isSelected])

  return (
    <div className="flex code ph2">
      <div className=" flex items-center w1">{icon}</div>
      <div
        ref={titleRef}
        className={`outline-0 br1 lh-copy ph2 ${
          isSelected ? 'bg-light-blue white' : ''
        }`}
        tabIndex={isSelected ? 0 : null}
        // onClick={() => effects.newLineZ(node.id)}
      >
        {title}
      </div>
    </div>
  )
}

function LineTreeView({ level, tree, selectedId }) {
  return [
    <div
      key={LineTree.id(tree)}
      style={{ paddingLeft: `${level * 1.5}rem` }}
    >
      <TitleLine
        {...{
          tree,
          icon: LineTree.expandIcon(tree),
          title: LineTree.title(tree),
          isSelected: LineTree.treeIdEq(selectedId, tree),
        }}
      />
    </div>,
    ...LineTree.visibleChildren(tree).map(childTree => (
      <LineTreeView
        key={LineTree.id(childTree)}
        {...{ level: level + 1, tree: childTree, selectedId }}
      />
    )),
  ]
}
function RootZipper({ model }) {
  return (
    <LineTreeView
      {...{
        level: 0,
        tree: R.compose(
          Zipper.tree,
          Zipper.root,
        )(model.zipper),
        selectedId: getSelectedId(model),
      }}
    />
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
