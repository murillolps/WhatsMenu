import vine from '@vinejs/vine'

export const clientValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(120),
    phone: vine
      .string()
      .trim()
      .regex(/^[0-9()+\-\s]{8,20}$/),
  })
)
