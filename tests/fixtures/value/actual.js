function UnauthorizedError(message) {
  this.message = message;
  this.stack = new Error().stack;
}

UnauthorizedError.prototype = Object.create(Error.prototype);

UnauthorizedError.prototype.name = 'UnauthorizedError';

angular
  .module('app')
  .value('UnauthorizedError', UnauthorizedError);
