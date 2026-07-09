migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('01movimento')
    col.fields.add(new NumberField({ name: 'ano', required: true, min: 1000, onlyInt: true }))
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('01movimento')
    col.fields.add(
      new NumberField({ name: 'ano', required: true, min: 2000, max: 2100, onlyInt: true }),
    )
    app.save(col)
  },
)
