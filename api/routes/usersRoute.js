import UsersController from '../controllers/usersController'

export default function addRoutes(router){
  router.get('/users',                  UsersController.get)
  router.get('/users/:id',              UsersController.show)
  router.post('/users/social',          UsersController.socialLogin)
  router.post('/users',                 UsersController.create)
  router.post('/users/confirm/:token',  UsersController.confirm)

  router.get('/protected/current_user',   UsersController.current_user)
  router.put('/protected/users/password', UsersController.updatePassword)  
  router.put('/protected/users/:id',      UsersController.update)
}