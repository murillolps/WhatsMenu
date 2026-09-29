/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

const ClientsController = () => import('#controllers/clients_controller')
const ProductsController = () => import('#controllers/products_controller')
const OrdersController = () => import('#controllers/orders_controller')

router.resource('clients', ClientsController).apiOnly().except(['destroy'])

router.resource('products', ProductsController).apiOnly().except(['destroy'])
router.patch('products/:id/activate', [ProductsController, 'activate'])
router.patch('products/:id/deactivate', [ProductsController, 'deactivate'])

router.post('orders/quote', [OrdersController, 'quote'])
router.resource('orders', OrdersController).only(['index', 'show', 'store'])
router.patch('orders/:id/status', [OrdersController, 'updateStatus'])
