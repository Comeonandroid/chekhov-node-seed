import FilesController from '../controllers/filesController'

export default function addRoutes(router) {
  router.post('/protected/files',    FilesController.create)
}