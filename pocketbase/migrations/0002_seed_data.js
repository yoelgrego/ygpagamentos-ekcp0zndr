migrate(
  (app) => {
    const seed = (colName, keyField, data) => {
      try {
        app.findFirstRecordByData(colName, keyField, data[keyField])
      } catch (_) {
        const col = app.findCollectionByNameOrId(colName)
        const record = new Record(col)
        for (const [k, v] of Object.entries(data)) {
          record.set(k, v)
        }
        app.save(record)
      }
    }

    seed('09catego', 'idcat', { idcat: 5001, descricao: 'Despesas Operacionais' })
    seed('09catego', 'idcat', { idcat: 5002, descricao: 'Investimentos' })
    seed('09catego', 'idcat', { idcat: 5003, descricao: 'Impostos e Taxas' })

    const c5001 = app.findFirstRecordByData('09catego', 'idcat', 5001).id
    const c5002 = app.findFirstRecordByData('09catego', 'idcat', 5002).id
    const c5003 = app.findFirstRecordByData('09catego', 'idcat', 5003).id

    seed('10natureza', 'idnat', { idnat: 6001, descricao: 'Material de Escritório', idcat: c5001 })
    seed('10natureza', 'idnat', { idnat: 6002, descricao: 'Equipamentos de TI', idcat: c5002 })
    seed('10natureza', 'idnat', { idnat: 6003, descricao: 'ISS', idcat: c5003 })

    seed('03fornecedor', 'idforn', {
      idforn: 1001,
      nome: 'TechCorp Supplies',
      cnpj_cpf: '00.000.000/0001-01',
      contato: 'João',
    })
    seed('03fornecedor', 'idforn', {
      idforn: 1002,
      nome: 'Office Master',
      cnpj_cpf: '11.111.111/0001-11',
      contato: 'Maria',
    })

    seed('04beneficiario', 'idben', { idben: 201, nome: 'Empresa Alpha', documento: 'DOC001' })
    seed('04beneficiario', 'idben', { idben: 202, nome: 'Fundação Beta', documento: 'DOC002' })

    seed('05moeda', 'idmoeda', { idmoeda: 10, simbolo: 'R$', descricao: 'Real Brasileiro' })
    seed('05moeda', 'idmoeda', { idmoeda: 20, simbolo: 'US$', descricao: 'Dólar Americano' })

    seed('06objeto', 'idobj', { idobj: 4001, descricao: 'Computador Desktop', tipo: 'Equipamento' })
    seed('06objeto', 'idobj', { idobj: 4002, descricao: 'Licença de Software', tipo: 'Serviço' })

    seed('07tipodoc', 'idtipodoc', { idtipodoc: 101, descricao: 'Nota Fiscal Eletrônica' })
    seed('07tipodoc', 'idtipodoc', { idtipodoc: 102, descricao: 'Recibo Simples' })

    seed('08pagador', 'idpag', { idpag: 301, nome: 'Caixa Central' })
    seed('08pagador', 'idpag', { idpag: 302, nome: 'Conta Corrente Banco A' })
  },
  (app) => {
    // Empty down migration
  },
)
