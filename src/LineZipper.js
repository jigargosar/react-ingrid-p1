import validate from 'aproba'
import * as Zipper from './TreeZipper'
import { appendGoR } from './TreeZipper'
import * as LineTree from './LineTree'
import {
  assoc,
  clamp,
  compose,
  isEmpty,
  pipe,
  reduce,
  reject,
  split,
  trim,
  until,
} from 'ramda'
import ow from 'ow'

export const initial = Zipper.singleton(LineTree.initial)

export function hasCollapsedChildren(z) {
  validate('O', arguments)
  const fn = pipe(
    Zipper.tree,
    LineTree.hasCollapsedChildren,
  )
  return fn(z)
}

export function allAncestorsExpanded(z) {
  validate('O', arguments)

  return !anyParentCollapsed(z)
}

export function anyParentCollapsed(z) {
  validate('O', arguments)

  if (Zipper.isRoot(z)) return false

  const pz = Zipper.parent(z)
  return hasCollapsedChildren(pz) || anyParentCollapsed(pz)
}

export function canCollapse(z) {
  validate('O', arguments)
  const fn = pipe(
    Zipper.tree,
    LineTree.canCollapse,
  )
  return fn(z)
}

export function canExpand(z) {
  validate('O', arguments)
  const fn = pipe(
    Zipper.tree,
    LineTree.canExpand,
  )
  return fn(z)
}

export function isTitleBlank(z) {
  validate('O', arguments)
  const fn = pipe(
    Zipper.tree,
    LineTree.title,
    trim,
    isEmpty,
  )
  return fn(z)
}

export function isBlankTitleLeaf(z) {
  validate('O', arguments)
  return Zipper.isLeaf(z) && isTitleBlank(z)
}

export function deleteBlankTitleLeaf(z) {
  validate('O', arguments)
  if (!isBlankTitleLeaf(z)) return null
  return Zipper.withRollback(Zipper.removeGoLOrROrUp)(z)
}

export function collapse(z) {
  validate('O', arguments)
  return Zipper.mapTree(LineTree.collapse)(z)
}

export function expand(z) {
  return Zipper.mapTree(LineTree.expand)(z)
}

export const prev = Zipper.withRollback(
  Zipper.findPrev(allAncestorsExpanded),
)

export const next = Zipper.withRollback(
  Zipper.findNext(allAncestorsExpanded),
)

export function parentWithRollback(z) {
  validate('O', arguments)
  return Zipper.withRollback(Zipper.parent, z)
}

export function indent(z) {
  validate('O', arguments)
  const ps = Zipper.prevSibling(z)
  if (ps) {
    const indent_ = pipe(
      Zipper.removeGoL,
      expand,
      Zipper.appendChildGoR(Zipper.tree(z)),
    )
    return indent_(z)
  }
  return z
}

export function outdent(z) {
  validate('O', arguments)
  const gp = Zipper.grandParent(z)
  if (gp) {
    const outdent_ = pipe(
      Zipper.removeGoUp,
      Zipper.appendGoR(Zipper.tree(z)),
    )
    return outdent_(z)
  }
  return z
}

export function deleteLine(z) {
  validate('O', arguments)

  return Zipper.withRollback(Zipper.removeGoROrLOrUp)(z)
}

export function setTitle(newTitle) {
  validate('S', arguments)
  return function(z) {
    return Zipper.mapDatum(assoc('title', newTitle))(z)
  }
}

export function moveL(z) {
  validate('O', arguments)

  return Zipper.withRollback(Zipper.moveL, z)
}

export function moveR(z) {
  validate('O', arguments)

  return Zipper.withRollback(Zipper.moveR, z)
}

const withTree = fn =>
  pipe(
    Zipper.tree,
    fn,
  )

const title = withTree(LineTree.title)

function rejectBlankLines(list) {
  validate('A', arguments)
  return reject(
    pipe(
      trim,
      isEmpty,
    ),
  )(list)
}

function getDepth(ln) {
  ow(ln, ow.string.nonEmpty)

  const match = ln.match(/^\t*/)
  if (match && match[0]) {
    return match[0].split('\t').length
  }
  return 0
}

function createZipperFromIndentedLines([fst, rest]) {
  ow(fst, ow.string.nonEmpty)

  const initialAcc = {
    z: Zipper.singleton(LineTree.newLine(fst)),
    depth: 0,
  }
  return reduce(
    (acc, ln) => {
      const lnDepth = getDepth(ln)
      const newLine = LineTree.newLine(ln.trimLeft())
      if (lnDepth > acc.depth) {
        return {
          z: Zipper.appendChildGoR(newLine, acc.z),
          depth: acc.depth + 1,
        }
      } else if (lnDepth === acc.depth) {
        return {
          z: Zipper.appendChildGoR(newLine, acc.z),
          depth: acc.depth,
        }
      } else if (lnDepth < acc.depth) {
        const nd = clamp(0, Math.MAX_SAFE_INTEGER, acc.depth - lnDepth)

        return until(
          acc => Zipper.isRoot(acc.z) || acc.depth === nd,
          acc => {
            return {
              z: Zipper.withRollback(Zipper.parent),
              depth: acc.depth - 1,
            }
          },
          acc,
        )

        // const nz = compose(
        //   Zipper.appendChildGoR(newLine),
        //   reduce(Zipper.withRollback(Zipper.parent), acc.z),
        // )(repeat(1, nd))
        // return { z: nz, depth: nd }
      }
      return { z: acc.z, depth: lnDepth }
    },
    initialAcc,
    rest,
  )
}

export function breakIfMultiLine(z) {
  validate('O', arguments)
  if (isTitleBlank(z)) return z

  const [fst, ...lines] = compose(
    rejectBlankLines,
    split('\n'),
    title,
  )(z)

  console.log(`lines`, lines)

  const sz = createZipperFromIndentedLines(lines)
  const pt = LineTree.toPlainText(Zipper.tree(sz))
  console.log(`pt`, pt)

  return compose(
    nz => {
      return reduce(
        (acc, ln) => {
          const nAcc = setTitle(ln)(appendGoR(LineTree.newLine(), acc))

          return nAcc
        },
        nz,
        lines,
      )
    },
    setTitle(fst),
  )(z)
}
