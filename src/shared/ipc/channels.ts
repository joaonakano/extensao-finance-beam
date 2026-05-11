export const IPC_CHANNELS = {
  AUTH_LOGIN: 'auth:login',
  AUTH_REGISTER: 'auth:register',
  AUTH_LOGOUT: 'auth:logout',
  AUTH_ME: 'auth:me',

  CATEGORIES_GET_ALL: 'categories:getAll',
  CATEGORIES_GET_BY_ID: 'categories:getById',
  CATEGORIES_CREATE: 'categories:create',
  CATEGORIES_UPDATE: 'categories:update',
  CATEGORIES_DELETE: 'categories:delete',

  PAYMENT_METHODS_GET_ALL: 'paymentMethods:getAll',
  PAYMENT_METHODS_GET_BY_ID: 'paymentMethods:getById',
  PAYMENT_METHODS_CREATE: 'paymentMethods:create',
  PAYMENT_METHODS_UPDATE: 'paymentMethods:update',
  PAYMENT_METHODS_DELETE: 'paymentMethods:delete',

  EXPENSES_GET_ALL: 'expenses:getAll',
  EXPENSES_GET_BY_ID: 'expenses:getById',
  EXPENSES_GET_CHILDREN: 'expenses:getChildren',
  EXPENSES_CREATE: 'expenses:create',
  EXPENSES_UPDATE: 'expenses:update',
  EXPENSES_DELETE: 'expenses:delete',

  SETTLEMENTS_GET_ALL: 'settlements:getAll',
  SETTLEMENTS_GET_BY_ID: 'settlements:getById',
  SETTLEMENTS_GET_BY_EXPENSE: 'settlements:getByExpense',
  SETTLEMENTS_CREATE: 'settlements:create',
  SETTLEMENTS_DELETE: 'settlements:delete'
} as const