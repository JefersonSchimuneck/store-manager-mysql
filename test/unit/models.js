const sinon = require('sinon');
const { expect } = require('chai');
require('dotenv').config();

const connection = require('../../models/connection');
const productModel = require('../../models/productModel');
const saleModel = require('../../models/saleModel');

describe('productModel.js', () => {
  const productPayload = {
    name: 'product_name',
    quantity: 10
  };

  describe('when a product is created succesfully', async () => {
    before(async () => {
      const execute = [{insertId: 1}];
      sinon.stub(connection, 'execute').resolves(execute);
    })

    after(async () => {
      connection.execute.restore();
    });

    it('returns an object with an "id" property', async () => {
      const { name, quantity } = productPayload;
      const response = await productModel.create(name, quantity);

      expect(response).to.be.an('object');
      expect(response).to.have.a.property('id');
    });
  });

  describe('when products from DB are requested', async () => {
    before(async () => {
      const execute = [[{id: 1, ...productPayload}]];
      sinon.stub(connection, 'execute').resolves(execute);
    })

    after(async () => {
      connection.execute.restore();
    });

    it('returns an array of objects', async() => {
      const response = await productModel.readAll();

      expect(response).to.be.an('array')
      expect(response[0]).to.be.an('object');
    });
  });

  describe('when an id is used to search for a product', async () => {
    before(async () => {
      const execute = [[{id: 1, ...productPayload}]];
      sinon.stub(connection, 'execute').resolves(execute);
    })

    after(async () => {
      connection.execute.restore();
    });
  
    it('returns an object with an "id" property', async() => {
      const { name, quantity } = productPayload;
      const product = await productModel.create(name, quantity);
      const response = await productModel.readById(product.id)
      
      expect(response).to.be.an('object');
      expect(response).to.have.a.property('id');
    });
  });

  describe('when a product property is updated', async () => {
    before(async () => {
      const execute = [[]];
      sinon.stub(connection, 'execute').resolves(execute);
    })

    after(async () => {
      connection.execute.restore();
    });

    it('returns an object with updated data', async() => {
      const { name, quantity } = productPayload;
      const product = await productModel.create(name, quantity);
      const response = await productModel.update(product.id, 'new_name', 10);
      
      expect(response).to.have.a.property('name', 'new_name');
    });
  });

  describe('when a product is deleted', async() => {
    before(async () => {
      const execute = [[]];
      sinon.stub(connection, 'execute').resolves(execute);
    })

    after(async () => {
      connection.execute.restore();
    });

    it('is removed from DB', async () => {
      const { name, quantity } = productPayload;
      const product = await productModel.create(name, quantity);
      await productModel.destroy(product.id);
      const response = await productModel.readById(product.id);

      expect(response).to.be.a('null')
    })
  })
});

describe('saletModel.js', () => {
  const salePayload = [
    { product_id: 1, quantity: 10 },
    { product_id: 2, quantity: 20 }
  ]

  describe('when a sale is created succesfully', async () => {
    before(async () => {
      const execute = [{insertId: 1}];
      sinon.stub(connection, 'execute').resolves(execute);
      sinon.stub(connection, 'query').resolves();
    })

    after(async () => {
      connection.execute.restore();
      connection.query.restore();
    });
  
    it('returns an object with an "id" property', async () => {
      const response = await saleModel.create([...salePayload]);

      expect(response).to.be.an('object');
      expect(response).to.have.a.property('id');
    });
  });

  describe('when sales from DB are requested', async () => {
    before(async () => {
      const execute = [[{id: 1}, {id: 2}]];
      sinon.stub(connection, 'execute').resolves(execute);
    })

    after(async () => {
      connection.execute.restore();
    });

    it('returns an array of objects', async() => {
      const response = await saleModel.readAll();

      expect(response).to.be.an('array')
      expect(response[0]).to.be.an('object');
    });
  });

  describe('when an id is used to search for a sale', async () => {
    before(async () => {
      const execute = [[{id: 1}]];
      sinon.stub(connection, 'execute').resolves(execute);
    })

    after(async () => {
      connection.execute.restore();
    });

    it('returns an object with an "id" property', async() => {
      const response = await saleModel.readById(1)
      
      expect(response).to.be.an('object');
      expect(response.sale[0]).to.have.a.property('id');
    });
  });

  describe('when a sale property is updated', async () => {
    before(async () => {
      const execute = [[]];
      sinon.stub(connection, 'execute').resolves(execute);
    })

    after(async () => {
      connection.execute.restore();
    });
  
    it('returns an object with updated data', async() => {
      const response = await saleModel.update(1, [{ product_id: 1, quantity: 10 }]);

      expect(response.itemUpdated[0]).to.have.a.property('product_id', 1)
    });
  });

  describe('when a sale is deleted', async() => {
    before(async () => {
      const execute = [[]];
      sinon.stub(connection, 'execute').resolves(execute);
    })

    after(async () => {
      connection.execute.restore();
    });

    it('is removed from DB', async () => {
      await saleModel.destroy(1);
      const response = await saleModel.readById(1)

      expect(response).to.be.a('null')
    })
  })
});
