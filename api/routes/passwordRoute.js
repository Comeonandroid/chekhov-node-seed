import PasswordController from '../controllers/passwordController'

export default function addRoutes(router) {
  router.post('/password/:token',       PasswordController.update)
  router.post('/password',              PasswordController.create)
}