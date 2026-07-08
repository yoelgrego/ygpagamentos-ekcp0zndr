migrate(
  (app) => {
    const c09 = new Collection({
      name: '09catego',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'idcat', type: 'number', onlyInt: true },
        { name: 'descricao', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(c09)

    const c10 = new Collection({
      name: '10natureza',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'idnat', type: 'number', onlyInt: true },
        { name: 'descricao', type: 'text', required: true },
        {
          name: 'idcat',
          type: 'relation',
          collectionId: app.findCollectionByNameOrId('09catego').id,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(c10)

    const c03 = new Collection({
      name: '03fornecedor',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'idforn', type: 'number', onlyInt: true },
        { name: 'nome', type: 'text', required: true },
        { name: 'cnpj_cpf', type: 'text' },
        { name: 'contato', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(c03)

    const c04 = new Collection({
      name: '04beneficiario',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'idben', type: 'number', onlyInt: true },
        { name: 'nome', type: 'text', required: true },
        { name: 'documento', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(c04)

    const c05 = new Collection({
      name: '05moeda',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'idmoeda', type: 'number', onlyInt: true },
        { name: 'simbolo', type: 'text', required: true },
        { name: 'descricao', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(c05)

    const c06 = new Collection({
      name: '06objeto',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'idobj', type: 'number', onlyInt: true },
        { name: 'descricao', type: 'text', required: true },
        { name: 'tipo', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(c06)

    const c07 = new Collection({
      name: '07tipodoc',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'idtipodoc', type: 'number', onlyInt: true },
        { name: 'descricao', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(c07)

    const c08 = new Collection({
      name: '08pagador',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'idpag', type: 'number', onlyInt: true },
        { name: 'nome', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(c08)

    const c01 = new Collection({
      name: '01movimento',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'idmov', type: 'number', onlyInt: true },
        { name: 'ano', type: 'number', required: true, min: 2000, max: 2100, onlyInt: true },
        { name: 'mes', type: 'number', required: true, min: 1, max: 12, onlyInt: true },
        { name: 'dia', type: 'number', required: true, min: 1, max: 31, onlyInt: true },
        { name: 'valor', type: 'number', required: true },
        {
          name: 'idnat',
          type: 'relation',
          collectionId: app.findCollectionByNameOrId('10natureza').id,
          maxSelect: 1,
        },
        {
          name: 'idforn',
          type: 'relation',
          collectionId: app.findCollectionByNameOrId('03fornecedor').id,
          maxSelect: 1,
        },
        {
          name: 'idben',
          type: 'relation',
          collectionId: app.findCollectionByNameOrId('04beneficiario').id,
          maxSelect: 1,
        },
        {
          name: 'idpag',
          type: 'relation',
          collectionId: app.findCollectionByNameOrId('08pagador').id,
          maxSelect: 1,
        },
        {
          name: 'idtipodoc',
          type: 'relation',
          collectionId: app.findCollectionByNameOrId('07tipodoc').id,
          maxSelect: 1,
        },
        {
          name: 'idmoeda',
          type: 'relation',
          collectionId: app.findCollectionByNameOrId('05moeda').id,
          maxSelect: 1,
        },
        { name: 'historico', type: 'text' },
        { name: 'situacao', type: 'text' },
        { name: 'cartao', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(c01)

    const c02 = new Collection({
      name: '02moveobjeto',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'idmoveobj', type: 'number', onlyInt: true },
        {
          name: 'idmov',
          type: 'relation',
          collectionId: app.findCollectionByNameOrId('01movimento').id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'idobj',
          type: 'relation',
          collectionId: app.findCollectionByNameOrId('06objeto').id,
          maxSelect: 1,
        },
        { name: 'quantidade', type: 'number' },
        { name: 'valor_unitario', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(c02)

    const cPass = new Collection({
      name: 'passagem',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'idpassagem', type: 'number', onlyInt: true },
        {
          name: 'idmov',
          type: 'relation',
          collectionId: app.findCollectionByNameOrId('01movimento').id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'trecho', type: 'text' },
        { name: 'data_viagem', type: 'date' },
        { name: 'passageiro', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(cPass)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('passagem'))
    app.delete(app.findCollectionByNameOrId('02moveobjeto'))
    app.delete(app.findCollectionByNameOrId('01movimento'))
    app.delete(app.findCollectionByNameOrId('08pagador'))
    app.delete(app.findCollectionByNameOrId('07tipodoc'))
    app.delete(app.findCollectionByNameOrId('06objeto'))
    app.delete(app.findCollectionByNameOrId('05moeda'))
    app.delete(app.findCollectionByNameOrId('04beneficiario'))
    app.delete(app.findCollectionByNameOrId('03fornecedor'))
    app.delete(app.findCollectionByNameOrId('10natureza'))
    app.delete(app.findCollectionByNameOrId('09catego'))
  },
)
