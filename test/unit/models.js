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
    it('returns an object with an "_id" property', async () => {
      const { name, quantity } = productPayload;
      const response = await productModel.create(name, quantity);

      expect(response).to.be.an('object');
      expect(response).to.have.a.property('_id');
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
    it('returns an object with an "_id" property', async() => {
      const { name, quantity } = productPayload;
      const product = await productModel.create(name, quantity);
      const response = await productModel.readById(product._id)
      
      expect(response).to.be.an('object');
      expect(response).to.have.a.property('_id');
    });
  });

  describe('when a product property is updated', async () => {
    it('returns an object with updated data', async() => {
      const { name, quantity } = productPayload;
      const product = await productModel.create(name, quantity);
      const response = await productModel.update(product._id, 'new_name', 10);
      
      expect(response).to.have.a.property('name', 'new_name');
    });
  });

  describe('when a product is deleted', async() => {
    it('is removed from DB', async () => {
      const { name, quantity } = productPayload;
      const product = await productModel.create(name, quantity);
      await productModel.destroy(product._id);
      const response = await productModel.readById(product._id);

      expect(response).to.be.a('null')
    })
  })
});

describe('saletModel.js', () => {
  const salePayload = [
    { productId: 'id1', quantity: 10 },
    { productId: 'id2', quantity: 20 }
  ]

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
    it('returns an object with an "_id" property', async () => {
      const response = await saleModel.create(salePayload);

      expect(response).to.be.an('object');
      expect(response).to.have.a.property('_id');
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
    it('returns an object with an "_id" property', async() => {
      const sale = await saleModel.create(salePayload);
      const response = await saleModel.readById(sale._id)
      
      expect(response).to.be.an('object');
      expect(response).to.have.a.property('_id');
    });
  });

  describe('when a sale property is updated', async () => {
    it('returns an object with updated data', async() => {
      const sale = await saleModel.create(salePayload);
      const response = await saleModel.update(sale._id, [{ productId: 'id3', quantity: 10 }]);
      
      expect(response.itensSold[0]).to.have.a.property('productId', 'id3')
    });
  });

  describe('when a sale is deleted', async() => {
    it('is removed from DB', async () => {
      const sale = await saleModel.create(salePayload);
      await saleModel.destroy(sale._id);
      const response = await saleModel.readById(sale._id);

      expect(response).to.be.a('null')
    })
  })
});
