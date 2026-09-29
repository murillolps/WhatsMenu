/*
|--------------------------------------------------------------------------
| Mensagens de validação
|--------------------------------------------------------------------------
|
| Mensagens padrão do VineJS traduzidas para português.
|
*/

import vine, { SimpleMessagesProvider } from '@vinejs/vine'

vine.messagesProvider = new SimpleMessagesProvider(
  {
    'required': 'O campo {{ field }} é obrigatório',
    'string': 'O campo {{ field }} deve ser um texto',
    'number': 'O campo {{ field }} deve ser um número',
    'array': 'O campo {{ field }} deve ser uma lista',
    'array.minLength': 'O campo {{ field }} deve ter pelo menos {{ min }} item(ns)',
    'enum': 'O campo {{ field }} deve ser um dos valores: {{ choices }}',
    'minLength': 'O campo {{ field }} deve ter no mínimo {{ min }} caracteres',
    'maxLength': 'O campo {{ field }} deve ter no máximo {{ max }} caracteres',
    'min': 'O campo {{ field }} deve ser no mínimo {{ min }}',
    'max': 'O campo {{ field }} deve ser no máximo {{ max }}',
    'withoutDecimals': 'O campo {{ field }} deve ser um número inteiro',
    'decimal': 'O campo {{ field }} deve ter no máximo 2 casas decimais',
    'regex': 'O campo {{ field }} está em formato inválido',
    'items.array.minLength': 'O pedido deve ter pelo menos um item',
    'items.*.quantity.min': 'A quantidade mínima por item é 1',
  },
  {
    'name': 'nome',
    'phone': 'telefone',
    'price': 'preço',
    'clientId': 'cliente',
    'items': 'itens',
    'items.*.productId': 'produto',
    'items.*.quantity': 'quantidade',
  }
)
