migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('05moeda')
    if (!col.fields.getByName('origem')) {
      col.fields.add(new TextField({ name: 'origem' }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('05moeda')
    if (col.fields.getByName('origem')) {
      col.fields.removeByName('origem')
    }
    app.save(col)
  },
)
