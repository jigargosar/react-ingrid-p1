import { F, identity, T } from 'ramda'

export const stopEditing = F
export const startEditing = T

export const isEditing = identity

export const initial = false
