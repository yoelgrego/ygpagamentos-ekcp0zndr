migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('01movimento')
    app.truncateCollection(col)
  },
  () => {},
)
