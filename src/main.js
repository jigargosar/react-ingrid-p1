import { useEffect, useMemo, useState } from 'react'
import { getCached, setCache } from './cache-helpers'
import validate from 'aproba'
import * as Zipper from './TreeZipper'
import isHotKey from 'is-hotkey'
import {
  append,
  compose,
  cond,
  defaultTo,
  head,
  identity,
  ifElse,
  init,
  isEmpty,
  last,
  lensPath,
  lensProp,
  map,
  mergeDeepRight,
  over,
  prop,
  T,
  tail,
  view,
} from 'ramda'
import * as LineZipper from './LineZipper'
import * as LineTree from './LineTree'
import { notEquals } from './ramda-helpers'
import ow from 'ow'
import * as EditMode from './EditMode'

const editModeL = lensPath(['editMode'])
const overEditMode = over(editModeL)

const zipperL = lensPath(['zipper'])
const overZipper = over(zipperL)

const zipperHistoryL = lensProp('zipperHistory')
const overZHLens = over(zipperHistoryL)

const zipperHistoryShape = ow.object.exactShape({
  left: ow.array,
  center: ow.object,
  right: ow.array,
})

function canUndoZH(zh) {
  ow(zh, zipperHistoryShape)
  return !isEmpty(zh.right)
}

function canRedoZH(zh) {
  ow(zh, zipperHistoryShape)
  return !isEmpty(zh.left)
}

const checkZipperHistory = ow.create('ZipperHistory', zipperHistoryShape)

function undoZH(zh) {
  checkZipperHistory(zh)
  ow(canUndoZH(zh), ow.boolean.true)

  const retZH = {
    left: [...zh.left, zh.center],
    center: head(zh.right),
    right: tail(zh.right),
  }
  checkZipperHistory(retZH)
  return retZH
}

function redoZH(zh) {
  checkZipperHistory(zh)
  ow(canRedoZH(zh), ow.boolean.true)

  const retZH = {
    left: init(zh.left),
    center: last(zh.left),
    right: [zh.center, ...zh.right],
  }
  checkZipperHistory(retZH)
  return retZH
}

function newLine() {
  const tree = LineTree.newLine()
  return overZipper(
    ifElse(
      Zipper.isRoot,
      Zipper.appendChildGoR(tree),
      Zipper.appendGoR(tree),
    ),
  )
}

function useEffects(setModelAndPushToHistory, setModel) {
  return useMemo(() => {
    function updateZipperAndPushToHistory(uFn) {
      setModelAndPushToHistory(overZipper(uFn))
    }

    const effects = {
      next() {
        updateZipperAndPushToHistory(LineZipper.next)
      },
      prev() {
        updateZipperAndPushToHistory(LineZipper.prev)
      },
      collapseOrParent() {
        updateZipperAndPushToHistory(
          ifElse(
            LineZipper.canCollapse,
            LineZipper.collapse,
            LineZipper.parentWithRollback,
          ),
        )
      },
      expandOrNext() {
        updateZipperAndPushToHistory(
          ifElse(LineZipper.canExpand, LineZipper.expand, LineZipper.next),
        )
      },
      moveL() {
        updateZipperAndPushToHistory(LineZipper.moveL)
      },
      moveR() {
        updateZipperAndPushToHistory(LineZipper.moveR)
      },
      indent() {
        updateZipperAndPushToHistory(LineZipper.indent)
      },
      outdent() {
        updateZipperAndPushToHistory(LineZipper.outdent)
      },
      newLine: () => {
        setModelAndPushToHistory(newLine())
      },
      newLineAndStartEditing() {
        effects.newLine()
        effects.startEditMode()
      },
      newLineOrDeleteEmptyLeaf() {
        setModelAndPushToHistory(m => {
          const zipper = m.zipper
          const emptyLeaf = LineZipper.isBlankTitleLeaf(zipper)

          if (emptyLeaf) {
            return compose(
              overZipper(LineZipper.deleteBlankTitleLeaf),
              overEditMode(EditMode.stopEditing),
            )(m)
          } else {
            return newLine()(m)
          }
        })
      },
      deleteLine: () => {
        updateZipperAndPushToHistory(LineZipper.deleteLine)
      },
      startEditMode() {
        setModelAndPushToHistory(overEditMode(EditMode.startEditing))
      },
      stopEditMode() {
        setModelAndPushToHistory(overEditMode(EditMode.stopEditing))
      },
      onTitleChange(newTitle) {
        updateZipperAndPushToHistory(LineZipper.setTitle(newTitle))
      },
      undo() {
        setModel(model => {
          const zh = view(zipperHistoryL)(model)
          if (canUndoZH(zh)) {
            const newModel = overZHLens(undoZH)(model)

            return { ...newModel, zipper: newModel.zipperHistory.center }
          }
          return model
        })
      },
      redo() {
        setModel(model => {
          const zh = view(zipperHistoryL)(model)
          if (canRedoZH(zh)) {
            const newModel = overZHLens(redoZH)(model)

            return { ...newModel, zipper: newModel.zipperHistory.center }
          }
          return model
        })
      },
    }
    return effects
  }, [setModelAndPushToHistory])
}

const createHotKeyHandler = compose(
  cond,
  append([T, identity]),
  map(([k, f]) => [
    isHotKey(k),
    e => {
      f()
      e.preventDefault()
    },
  ]),
)

export function getIsEditMode(model) {
  validate('O', arguments)
  return model.editMode
}

function useCachedModel() {
  const [model, setModel] = useState(() => {
    const def = {
      zipper: LineZipper.initial,
      editMode: false,
      zipperHistory: { left: [], center: LineZipper.initial, right: [] },
    }

    return compose(
      // tap(console.log),
      mergeDeepRight(def),
      defaultTo({}),
      getCached,
    )('app-model')
  })

  function setAndValidateModel(fn) {
    setModel(m => {
      const retM = fn(m)
      ow(
        retM,
        ow.object.partialShape({
          zipperHistory: zipperHistoryShape,
          zipper: ow.object.nonEmpty,
        }),
      )
      return retM
    })
  }

  return [model, setAndValidateModel]
}

export function useAppModel() {
  const [model, setModel] = useCachedModel()

  function setModelAndPushToHistory(fn) {
    validate('F', arguments)
    setModel(oldModel => {
      const newModel = fn(oldModel)

      console.assert(oldModel.zipperHistory === newModel.zipperHistory)

      const zipperHistory = oldModel.zipperHistory
      const oldZipper = oldModel.zipperHistory.center

      const newZipper = newModel.zipper
      if (notEquals(newZipper, oldZipper)) {
        return {
          ...newModel,
          zipperHistory: {
            left: [],
            center: newZipper,
            right: [oldZipper, ...zipperHistory.right],
          },
        }
      }

      return newModel
    })
  }

  useEffect(() => {
    setCache('app-model', model)
    window.m = model
  }, [model])

  useEffect(() => {
    function listener(e) {
      validate('O', arguments)
      // console.log(`e`, e)
      const normalModeKeyMap = [
        ['down', effects.next],
        ['up', effects.prev],
        ['left', effects.collapseOrParent],
        ['right', effects.expandOrNext],
        ['tab', effects.indent],
        ['shift+tab', effects.outdent],
        ['cmd+up', effects.moveL],
        ['cmd+down', effects.moveR],
        ['space', effects.startEditMode],
        ['enter', effects.newLineAndStartEditing],
        ['delete', effects.deleteLine],
        ['cmd+z', effects.undo],
        ['cmd+shift+z', effects.redo],
      ]
      const editModeKeyMap = [
        ['tab', effects.indent],
        ['shift+tab', effects.outdent],
        [['cmd+enter', 'esc'], effects.stopEditMode],
        ['enter', effects.newLineOrDeleteEmptyLeaf],
      ]

      createHotKeyHandler(
        model.editMode ? editModeKeyMap : normalModeKeyMap,
      )(e)
    }

    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [model.editMode])

  const effects = useEffects(setModelAndPushToHistory, setModel)
  return [model, effects]
}

export function getSelectedId(model) {
  return compose(
    prop('id'),
    Zipper.datum,
  )(model.zipper)
}
