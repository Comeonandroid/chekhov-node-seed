import SessionsController from '../controllers/sessionsController'

export default function addRoutes(router){
  router.post('/sessions', SessionsController.create)
}