export class BadRequestException {
  constructor(message) {
    this.message = message || 'Bad Request'
    this.status = 400
  }
}

export class NotAuthorizedException {
  constructor(message) {
    this.message = message || 'Unauthorized';
    this.status = 401;
  }
}

export class ForbiddenException {
  constructor(message) {
    this.message = message || 'Forbidden'
    this.status = 403
  }
}

export class NotFoundException {
  constructor(message) {
    this.message = message || 'Not found'
    this.status = 404
  }
}

export class ValidationException {
  constructor(message) {
    this.message = message || 'Invalid'
    this.status = 422
  }
}
