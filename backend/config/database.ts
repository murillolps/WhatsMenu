import { mkdirSync } from 'node:fs'
import app from '@adonisjs/core/services/app'
import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const connection = env.get('DB_CONNECTION', 'mysql')

if (connection === 'sqlite') {
  mkdirSync(app.tmpPath(), { recursive: true })
}

const dbConfig = defineConfig({
  connection,
  connections: {
    mysql: {
      client: 'mysql2',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },

    /**
     * Alternativa sem servidor de banco (usada nos testes automatizados).
     */
    sqlite: {
      client: 'better-sqlite3',
      connection: {
        filename: app.tmpPath(env.get('DB_SQLITE_FILE', 'db.sqlite3')),
      },
      useNullAsDefault: true,
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
})

export default dbConfig
