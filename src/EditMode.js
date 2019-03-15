import { prop } from 'ramda'

export const stopEditing = () => ({ editing: false, isNew: null })
export const startEditing = () => ({ editing: true, isNew: false })
export const startEditingNew = () => ({ editing: true, isNew: true })

export const isEditing = prop('editing')

export const initial = { editing: false, isNew: null }
