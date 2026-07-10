routerAdd(
  'POST',
  '/backend/v1/clear-movimentos',
  (e) => {
    try {
      const moveObjCol = $app.findCollectionByNameOrId('02moveobjeto')
      $app.truncateCollection(moveObjCol)

      const passagemCol = $app.findCollectionByNameOrId('passagem')
      $app.truncateCollection(passagemCol)

      const movCol = $app.findCollectionByNameOrId('01movimento')
      $app.truncateCollection(movCol)

      return e.json(200, { success: true, message: 'All movimentos cleared' })
    } catch (err) {
      return e.json(500, { error: 'Failed to clear data' })
    }
  },
  $apis.requireAuth(),
)
