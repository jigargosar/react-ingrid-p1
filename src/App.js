import React, { useLayoutEffect, useRef } from 'react'
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
  useLayoutEffect(() => {
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
  useLayoutEffect(resizeHeight, [title, isEditing])
  return (
    <div className="flex code ph2">
      <IconContainer>{icon}</IconContainer>
      <div
        className={`flex-grow-1 flex br2 ph2 pv1 lh-title ${
          isEditing
            ? 'bg-white black-80'
            : isSelected
            ? 'bg-blue white'
            : 'bg-transparent color-inherit'
        }`}
      >
        {isEditing ? (
          <textarea
            rows={1}
            ref={titleRef}
            className={`flex-grow-1 ma0 pa0 bn lh-inherit outline-0 resize-none bg-inherit color-inherit`}
            tabIndex={isSelected ? 0 : null}
            value={title}
            onChange={e => onTitleChange(e.target.value)}
            disabled={!isEditing}
          />
        ) : (
          <div
            ref={titleRef}
            className={`flex-grow-1 pre-wrap outline-0`}
            tabIndex={isSelected ? 0 : null}
          >
            {title || 'Untitled'}
          </div>
        )}
      </div>
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

function App() {
  const [model, effects] = useAppModel()

  const isEditMode = getIsEditMode(model)
  return (
    <div className={`min-vh-100 ${isEditMode ? 'bg-black-20' : ''}`}>
      {/*<RootTree model={model} effects={effects} />*/}
      <LineTreeView
        {...{
          level: 0,
          tree: Zipper.rootTree(model.zipper),
          selectedId: getSelectedId(model),
          isEditMode,
          effects,
        }}
      />
    </div>
  )
}

export default App
