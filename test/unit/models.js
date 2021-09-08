const sinon = require('sinon');
const { expect } = require('chai');
const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');

const productModel = require('../../models/productModel');
const saleModel = require('../../models/saleModel');

describe('productModel.js', () => {
  const productPayload = {
    name: 'product_name',
    quantity: 10
  };

  before(async () => {
    const DBServer = new MongoMemoryServer();
    const URLMock = await DBServer.getUri();
  
    const connectionMock = await MongoClient
      .connect(URLMock, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
  
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);
  });
  
  after(() => {
    MongoClient.connect.restore();
    sinon.restore();
  });

  describe('when a product is created succesfully', async () => {
    it('returns an object with an "id" property', async () => {
      const { name, quantity } = productPayload;
      const response = await productModel.create(name, quantity);

      expect(response).to.be.an('object');
      expect(response).to.have.a.property('id');
    });
  });

  describe('when products from DB are requested', async () => {
    it('returns an array of objects', async() => {
      const response = await productModel.readAll();

      expect(response).to.be.an('array')
      expect(response[0]).to.be.an('object');
    });
  });

  describe('when an id is used to search for a product', async () => {
    it('returns an object with an "id" property', async() => {
      const { name, quantity } = productPayload;
      const product = await productModel.create(name, quantity);
      const response = await productModel.readById(product.id)
      
      expect(response).to.be.an('object');
      expect(response).to.have.a.property('id');
    });
  });

  describe('when a product property is updated', async () => {
    it('returns an object with updated data', async() => {
      const { name, quantity } = productPayload;
      const product = await productModel.create(name, quantity);
      const response = await productModel.update(product.id, 'new_name', 10);
      
      expect(response).to.have.a.property('name', 'new_name');
    });
  });

  describe('when a product is deleted', async() => {
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
  before(async () => {
    const DBServer = new MongoMemoryServer();
    const URLMock = await DBServer.getUri();
  
    const connectionMock = await MongoClient
      .connect(URLMock, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
  
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);
  });
  
  after(() => {
    MongoClient.connect.restore();
    sinon.restore();
  });

  describe('when a sale is created succesfully', async () => {
    it('returns an object with an "id" property', async () => {
      const { id: id1 } = await productModel.create("produto1", 10);
      const { id: id2 } = await productModel.create("produto2", 20);
      const response = await saleModel.create([
        { product_id: id1, quantity: 10 },
        { product_id: id2, quantity: 20 }
      ]);

      expect(response).to.be.an('object');
      expect(response).to.have.a.property('id');
    });
  });

  describe('when sales from DB are requested', async () => {
    it('returns an array of objects', async() => {
      const response = await saleModel.readAll();

      expect(response).to.be.an('array')
      expect(response[0]).to.be.an('object');
    });
  });

  describe('when an id is used to search for a sale', async () => {
    it('returns an object with an "id" property', async() => {
      const { id: id1 } = await productModel.create("produto1", 10);
      const { id: id2 } = await productModel.create("produto2", 20);
      const { id } = await saleModel.create([
        { product_id: id1, quantity: 10 },
        { product_id: id2, quantity: 20 }
      ]);
      const response = await saleModel.readById(id)
      
      expect(response).to.be.an('array');
      expect(response[0]).to.have.a.property('id');
    });
  });

  describe('when a sale property is updated', async () => {
    it('returns an object with updated data', async() => {
      const { id: id1 } = await productModel.create("produto1", 10);
      const { id: id2 } = await productModel.create("produto2", 20);
      const { id } = await saleModel.create([
        { product_id: id1, quantity: 10 },
        { product_id: id2, quantity: 20 }
      ]);
      const response = await saleModel.update(id, [{ product_id: id1, quantity: 10 }]);

      expect(response.itemsSold[0]).to.have.a.property('product_id', id1)
    });
  });

  describe('when a sale is deleted', async() => {
    it('is removed from DB', async () => {
      const { id: id1 } = await productModel.create("produto1", 10);
      const { id: id2 } = await productModel.create("produto2", 20);
      const { id } = await saleModel.create([
        { product_id: id1, quantity: 10 },
        { product_id: id2, quantity: 20 }
      ]);
      await saleModel.destroy(id);
      const response = await saleModel.readById(id);

      expect(response).to.be.a('null')
    })
  })
});
