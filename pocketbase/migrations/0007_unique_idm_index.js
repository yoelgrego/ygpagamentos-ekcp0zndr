migrate(
  (app) => {
    app
      .db()
      .newQuery(
        'DELETE FROM `01movimento` WHERE id NOT IN (SELECT MIN(id) FROM `01movimento` GROUP BY idm)',
      )
      .execute()

    const col = app.findCollectionByNameOrId('01movimento')
    col.addIndex('idx_01movimento_idm', true, 'idm', '')
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('01movimento')
    col.removeIndex('idx_01movimento_idm')
    app.save(col)
  },
)
