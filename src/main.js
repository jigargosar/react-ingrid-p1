import { useEffect, useMemo, useState } from 'react'
import { getCached, setCache } from './cache-helpers'
import validate from 'aproba'
import * as Zipper from './TreeZipper'
import isHotKey from 'is-hotkey'
import {
  append,
  assoc,
  compose,
  cond,
  defaultTo,
  identity,
  ifElse,
  isEmpty,
  lensPath,
  lensProp,
  map,
  mergeDeepRight,
  over,
  prop,
  T,
  when,
} from 'ramda'
import * as LineZipper from './LineZipper'
import * as LineTree from './LineTree'
import { notEquals } from './ramda-helpers'

const zipperL = lensPath(['zipper'])
const overZipper = over(zipperL)

const zipperHistoryL = lensProp('zipperHistory')
const overZHLens = over(zipperHistoryL)

function canUndoZH(zh) {
  validate('O', arguments)
  return !isEmpty(zh.right)
}

function invariant(bool, msg = 'no msg provided') {
  if (!bool) {
    throw new Error(`Invariant failed: ${msg}`)
  }
}

function undoZH(zh) {
  validate('O', arguments)
  invariant(canUndoZH(zh))

  return !isEmpty(zh.right)
}

const stopEditMode = assoc('editMode', false)

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

const startEditMode = assoc('editMode', true)

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
              stopEditMode,
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
        setModelAndPushToHistory(startEditMode)
      },
      stopEditMode() {
        setModelAndPushToHistory(stopEditMode)
      },
      onTitleChange(newTitle) {
        updateZipperAndPushToHistory(LineZipper.setTitle(newTitle))
      },
      undo() {
        setModel(model => {
          return overZHLens(when(canUndoZH, undoZH))(model)
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

export function useAppModel() {
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

  // useEffect(() => {
  //   setModel(oldModel => {
  //     const oldHistory = oldModel.zipperHistory
  //     if (notEquals(oldModel.zipper, oldHistory.center)) {
  //       return {
  //         ...oldModel,
  //         zipperHistory: {
  //           left: [],
  //           center: oldModel.zipper,
  //           right: [oldHistory.center, ...oldHistory.right],
  //         },
  //       }
  //     }
  //
  //     return oldModel
  //   })
  // }, [model.zipper])

  // const [, setZipperHistory] = useState([])

  // function setModelWithoutHistory(fn) {
  //   validate('F', arguments)
  //   setModel(fn)
  // }
  //
  // function setModelAndPushToHistory(fn) {
  //   validate('F', arguments)
  //   setModel(oldModel=>{
  //     const newModel = fn(oldModel)
  //
  //
  //     if(notEquals(oldModel.zipper, newModel.zipper)){
  //       setZipperHistory(append(newModel.zipper))
  //     }
  //
  //     return newModel
  //   })
  // }

  // const prevModelRef = useRef(model)
  // useEffect(() => {
  //   const prevModel = prevModelRef.current
  //   if (!equals(prevModel.zipper, model.zipper)) {
  //     console.log(`zipperHistory`, zipperHistory)
  //     // console.log('zipper changed', prevModel.zipper, model.zipper)
  //     setZipperHistory(append(model.zipper))
  //     prevModel.current = model
  //   }
  // }, [model.zipper])

  useEffect(() => {
    setCache('app-model', model)
    window.m = model
  }, [model])

  // function undoHistory() {
  //   debugger
  //   setZipperHistory(history => {
  //     debugger
  //     console.log(`history`, history)
  //     const lastHistoryItem = last(history)
  //     if (lastHistoryItem) {
  //       setModelWithoutHistory(overZipper(always(lastHistoryItem)))
  //       return init(history)
  //     }
  //     return history
  //   })
  // }

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
        // ['cmd+z', undoHistory],
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
