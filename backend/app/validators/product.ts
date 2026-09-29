import vine from '@vinejs/vine'

export const productValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(120),
    price: vine.number().min(0.01).max(99_999_999.99).decimal([0, 2]),
  })
)
