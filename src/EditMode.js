import { both, prop } from 'ramda'

export const stopEditing = () => ({ editing: false, isNew: null })
export const startEditing = () => ({ editing: true, isNew: false })
export const startEditingNew = () => ({ editing: true, isNew: true })

export const isEditing = prop('editing')
export const isEditingNew = both(prop('editing'), prop('isNew'))

export const initial = { editing: false, isNew: null }
