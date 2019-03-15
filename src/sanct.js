const { create, env } = require('sanctuary')
const $ = require('sanctuary-def')
const type = require('sanctuary-type-identifiers')

//    Identity :: a -> Identity a
const Identity = x => {
  const identity = Object.create(Identity$prototype)
  identity.value = x
  return identity
}

Identity['@@type'] = 'my-package/Identity@1'

const Identity$prototype = {
  constructor: Identity,
  '@@show': function() {
    return `Identity (${S.show(this.value)})`
  },
  'fantasy-land/map': function(f) {
    return Identity(f(this.value))
  },
}

//    IdentityType :: Type -> Type
const IdentityType = $.UnaryType(Identity['@@type'])(
  'http://example.com/my-package#Identity',
)(x => type(x) === Identity['@@type'])(identity => [identity.value])

export const S = create({
  checkTypes: process.env.NODE_ENV !== 'production',
  env: env.concat([IdentityType($.Unknown)]),
})

S.map(S.sub(1))(Identity(43))
