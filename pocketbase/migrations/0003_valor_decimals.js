migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('01movimento')
    col.fields.add(new NumberField({ name: 'valor', required: true, onlyInt: false }))
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('01movimento')
    col.fields.add(new NumberField({ name: 'valor', required: true, onlyInt: true }))
    app.save(col)
  },
)
