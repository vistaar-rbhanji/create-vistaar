/**
 * @typedef {Object} AppInfo
 * @property {string} id
 * @property {string} projectName
 * @property {string} frontend
 * @property {string} backend
 * @property {string} database
 * @property {string} orm
 * @property {string} uiFramework
 * @property {string} authentication
 * @property {string} docker
 * @property {string} createdAt
 */

/**
 * @typedef {Object} HealthInfo
 * @property {"running"|"stopped"} server
 * @property {"connected"|"disconnected"|"not_configured"} database
 * @property {"healthy"|"degraded"} status
 * @property {"working"|"down"} api
 */

/**
 * @typedef {Object} SetupStatusCommands
 * @property {string} createDb
 * @property {string} createDbSql
 * @property {string} migrate
 * @property {string} seed
 * @property {string} setup
 * @property {string} docker
 * @property {string} doctor
 */

/**
 * @typedef {Object} SetupStatus
 * @property {boolean} projectGenerated
 * @property {string} projectName
 * @property {string} databaseEngine
 * @property {boolean} databaseRequired
 * @property {boolean} databaseConfigured
 * @property {boolean} databaseConnected
 * @property {boolean} migrationCompleted
 * @property {boolean} seedCompleted
 * @property {boolean} backendRunning
 * @property {boolean} frontendRunning
 * @property {boolean} dockerEnabled
 * @property {boolean} authenticationEnabled
 * @property {boolean} setupComplete
 * @property {string} dbName
 * @property {SetupStatusCommands} commands
 */

export {};
