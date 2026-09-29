import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Violação de regra de negócio (ex.: produto inativo, transição de
 * status inválida). Responde 422 no mesmo formato dos erros de validação.
 */
export default class BusinessRuleException extends Exception {
  static status = 422
  static code = 'E_BUSINESS_RULE'

  async handle(error: this, ctx: HttpContext) {
    ctx.response.status(error.status).send({
      errors: [{ message: error.message, code: error.code }],
    })
  }
}
