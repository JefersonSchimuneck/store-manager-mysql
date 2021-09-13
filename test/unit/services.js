const sinon = require('sinon');
const { expect } = require('chai');
const { Sequelize } = require('sequelize')
const Importer = require('mysql-import')
require('dotenv').config();

const productModel = require('../../models/productModel');
const productService = require('../../services/productService');
const saleModel = require('../../models/saleModel');
const saleService = require('../../services/saleService');

describe('productService.js', () => {
  const productPayload = {
    id: 1,
    name: 'product',
    quantity: 10
  };

  before(async () => {
    const {
      MYSQL_USER,
      MYSQL_PASSWORD,
      MYSQL_HOST
    } = process.env;

    const importer = new Importer(
      { user: MYSQL_USER, password: MYSQL_PASSWORD, host: MYSQL_HOST }
    );
  
    await importer.import('./StoreManager.sql');

    importer.disconnect();

    sequelize = new Sequelize(
      `mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}:3306/StoreManager`
    );
  });

  describe('when a product is created succesfully', async () => {
    before(() => {
      sinon.stub(productModel, 'create')
        .resolves(productPayload);
    });
  
    after(() => {
      productModel.create.restore();
      sinon.restore();
    });

    it('returns an object with an "id" property', async () => {
      const { name, quantity } = productPayload;
      const response = await productService.create(name, quantity);

      expect(response).to.be.an('object');
      expect(response).to.have.a.property('id');
    });
  });

  describe('when products from DB are requested', async () => {
    before(() => {
      sinon.stub(productModel, 'readAll')
        .resolves([productPayload]);
    });
  
    after(() => {
      productModel.readAll.restore();
    });

    it('returns an array of objects', async() => {
      const response = await productService.readAll();

      expect(response).to.be.an('array')
      expect(response[0]).to.be.an('object');
    });
  });

  describe('when an id is used to search for a product', async () => {
    before(() => {
      sinon.stub(productModel, 'readById')
        .resolves(productPayload);
    });
  
    after(() => {
      productModel.readById.restore();
    });

    it('returns an object with an "id" property', async() => {
      const { id } = productPayload;
      const response = await productService.readById(id )
      
      expect(response).to.be.an('object');
      expect(response).to.have.a.property('id');
    });
  });

  describe('when a product property is updated', async () => {
    const updatedProduct = {
      _id: 1,
      name: 'new_name',
      quantity: 10
    };

    before(() => {
      sinon.stub(productModel, 'update')
        .resolves(updatedProduct);
    });
  
    after(() => {
      productModel.update.restore();
      sinon.restore();
    });

    it('returns an object with updated data', async() => {
      const { name, quantity } = productPayload;
      const product = await productService.create(name, quantity);
      const response = await productService.update(product.id, 'new_name', 10);
      
      expect(response).to.have.a.property('name', 'new_name');
    });
  });

  describe('when a product is deleted', async() => {
    before(() => {
      sinon.stub(productModel, 'destroy')
        .resolves(productPayload);
    });
  
    after(() => {
      productModel.destroy.restore();
    });

    it('is removed from DB', async () => {
      const { id } = productPayload
      const response = await productService.destroy(id);

      expect(response).to.be.an('object');
    });
  });
});

describe('saleService.js', () => {
  const salePayload = [
    { product_id: 1, quantity: 10 },
    { product_id: 2, quantity: 20 }
  ];

  const productPayload = {
    id: 1,
    name: 'product',
    quantity: 10
  };

  describe('when a sale is created succesfully', async () => {
    before(() => {
      sinon.stub(saleModel, 'create')
        .resolves({ id: 1, itensSold: salePayload });
      sinon.stub(productModel, 'readById')
        .resolves(productPayload);
    });
  
    after(() => {
      saleModel.create.restore();
      productModel.readById.restore();
      sinon.restore();
    });

    it('returns an object with an "id" property', async () => {
      const response = await saleService.create(salePayload);

      expect(response).to.be.an('object');
      expect(response).to.have.a.property('id');
    });
  });

  describe('when sales from DB are requested', async () => {
    before(() => {
      sinon.stub(saleModel, 'readAll')
        .resolves([{ id: 1, itensSold: salePayload }]);
    });
  
    after(() => {
      saleModel.readAll.restore();
    });

    it('returns an array of objects', async() => {
      const response = await saleService.readAll();

      expect(response).to.be.an('array')
      expect(response[0]).to.be.an('object');
    });
  });

  describe('when an id is used to search for a sale', async () => {
    before(() => {
      sinon.stub(saleModel, 'readById')
        .resolves({ id: 1, itensSold: salePayload });
    });
  
    after(() => {
      saleModel.readById.restore();
    });

    it('returns an object with an "id" property', async() => {
      const response = await saleService.readById(1);
      
      expect(response).to.be.an('object');
      expect(response).to.have.a.property('id');
    });
  });

  describe('when a sale property is updated', async () => {
    const updatedsale = [
      { product_id: 1, quantity: 99 },
    ]

    before(() => {
      sinon.stub(saleModel, 'create')
        .resolves({ id: 2, itensSold: salePayload });
      sinon.stub(saleModel, 'update')
        .resolves({ id: 2, itensSold: updatedsale });
      sinon.stub(productModel, 'readById')
        .resolves(productPayload);
    });
  
    after(() => {
      saleModel.create.restore();
      saleModel.update.restore();
      productModel.readById();
      sinon.restore();
    });

    it('returns an object with updated data', async() => {
      const sale = await saleService.create(salePayload);
      const response = await saleService.update(sale.id, updatedsale);
      
      expect(response.itensSold[0]).to.have.a.property('quantity', 99);
    });
  });

  describe('when a sale is deleted', async() => {
    before(() => {
      sinon.stub(saleModel, 'create')
        .resolves({ id: 1, itensSold: salePayload });
      sinon.stub(saleModel, 'destroy')
        .resolves({ sale: [{ id: 1, product_id: 1, quantity: 2 }]});
      sinon.stub(productModel, 'readById')
        .resolves(productPayload);
      sinon.stub(productModel, 'update')
        .resolves(productPayload);
    });
  
    after(() => {
      saleModel.create.restore();
      saleModel.destroy.restore();
      productModel.readById.restore();
      productModel.update.restore();
      sinon.restore();
    });

    it('it returns an object', async () => {
      const sale = await saleService.create(salePayload);
      const { id } = sale;
      const response = await saleService.destroy(id);
      expect(response).to.be.an('object');
    });
  });
});
