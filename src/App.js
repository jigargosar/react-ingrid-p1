import React, { useEffect, useRef } from 'react'
import { getIsEditMode, getSelectedId, useAppModel } from './main'
import * as Zipper from './TreeZipper'
import * as LineTree from './LineTree'

function IconContainer(props) {
  return (
    <div
      className="w1 flex items-center justify-center us-none"
      {...props}
    />
  )
}

function TitleLine({ title, icon, isSelected, isEditing, onTitleChange }) {
  const titleRef = useRef()
  useEffect(() => {
    const el = titleRef.current
    if (el && isSelected) {
      el.focus()
    }
  }, [isSelected, isEditing, titleRef.current])

  function resizeHeight() {
    const el = titleRef.current
    if (el) {
      el.style.height = ''
      el.style.height = el.scrollHeight + 'px'
    }
  }
  return (
    <div className="flex code ph2">
      <IconContainer>{icon}</IconContainer>
      <textarea
        rows={1}
        ref={titleRef}
        className={`dib ma0 bw0 br2 lh-copy outline-0 resize-none ${
          isSelected ? 'bg-blue white' : 'bg-transparent color-inherit'
        }`}
        tabIndex={isSelected ? 0 : null}
        // onClick={() => effects.newLineZ(node.id)}
        disabled={!isEditing}
        value={title}
        onChange={e => {
          resizeHeight()
          return onTitleChange(e.target.value)
        }}
      />
    </div>
  )
}

function LineTreeView(props) {
  const { level, tree, selectedId, isEditMode, effects } = props
  const selected = LineTree.idEq(selectedId, tree)
  return (
    <>
      <div
        key={LineTree.id(tree)}
        style={{ paddingLeft: `${level * 1.5}rem` }}
      >
        <TitleLine
          {...{
            icon: LineTree.expandIcon(tree),
            title: LineTree.title(tree),
            isSelected: selected,
            isEditing: isEditMode && selected,
            onTitleChange: effects.onTitleChange,
          }}
        />
      </div>
      {LineTree.visibleChildren(tree).map(childTree => (
        <LineTreeView
          key={LineTree.id(childTree)}
          {...props}
          {...{
            level: level + 1,
            tree: childTree,
          }}
        />
      ))}
    </>
  )
}
function RootZipper({ model, effects }) {
  return (
    <LineTreeView
      {...{
        level: 0,
        tree: Zipper.rootTree(model.zipper),
        selectedId: getSelectedId(model),
        isEditMode: getIsEditMode(model),
        effects,
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
