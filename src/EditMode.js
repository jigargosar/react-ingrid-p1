import { assoc } from 'ramda'

export const stopEditMode = assoc('editMode', false)
export const startEditMode = assoc('editMode', true)
