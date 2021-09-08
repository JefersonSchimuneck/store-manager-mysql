const frisby = require('frisby');
const mysql = require('mysql2/promise');
require('dotenv').config();

const products = [
  { name: 'Martelo de Thor', quantity: 10 },
  { name: 'Traje de encolhimento', quantity: 20 },
  { name: 'Escudo do Capitão América', quantity: 30 },
];
const url = 'http://localhost:3000';
const INVALID_ID = 99999;

describe('5 - Crie um endpoint para cadastrar vendas', () => {
  const connection = mysql.createPool({
    host: process.env.MYSQL_HOST || 'mysql',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'password',
  });

  beforeEach(async () => {
    const values = products.map(({name, quantity}) => [name, quantity]);
    await connection.query(
      'INSERT INTO StoreManager.products (name, quantity) VALUES ?',
      [values],
    )
  });

  afterEach(async () => {
    await connection.execute('DELETE FROM StoreManager.products');
    await connection.execute('DELETE FROM StoreManager.sales');
    await connection.execute('DELETE FROM StoreManager.sales_products');
  });

  afterAll(async () => {
    await connection.end();
  });

  it('Será validado que não é possível cadastrar compras com quantidade menor que zero', async () => {
    let result;
    let resultProductId;

    await frisby
      .get(`${url}/products/`)
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        result = JSON.parse(body);
        resultProductId = result.products[0].id;
      });

    await frisby
      .post(`${url}/sales/`, [
        {
          product_id: resultProductId,
          quantity: -1,
        },
      ])
      .expect('status', 422)
      .then((secondResponse) => {
        const { json } = secondResponse;
        expect(json.err.code).toBe('invalid_data');
        expect(json.err.message).toBe('Wrong product ID or invalid quantity');
      });
  });

  it('Será validado que não é possível cadastrar compras com quantidade igual a zero', async () => {
    let result;
    let resultProductId;

    await frisby
      .get(`${url}/products/`)
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        result = JSON.parse(body);
        resultProductId = result.products[0].id;
      });

    await frisby
      .post(`${url}/sales/`, [
        {
          product_id: resultProductId,
          quantity: 0,
        },
      ])
      .expect('status', 422)
      .then((secondResponse) => {
        const { json } = secondResponse;
        expect(json.err.code).toBe('invalid_data');
        expect(json.err.message).toBe('Wrong product ID or invalid quantity');
      });
  });

  it('Será validado que não é possível cadastrar compras com uma string no campo quantidade', async () => {
    let result;
    let resultProductId;

    await frisby
      .get(`${url}/products/`)
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        result = JSON.parse(body);
        resultProductId = result.products[0].id;
      });

    await frisby
      .post(`${url}/sales/`, [
        {
          product_id: resultProductId,
          quantity: 'String',
        },
      ])
      .expect('status', 422)
      .then((secondResponse) => {
        const { json } = secondResponse;
        expect(json.err.code).toBe('invalid_data');
        expect(json.err.message).toBe('Wrong product ID or invalid quantity');
      });
  });

  it('Será validado que é possível criar uma compra com sucesso', async () => {
    let result;
    let resultProductId;

    await frisby
      .get(`${url}/products/`)
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        result = JSON.parse(body);
        resultProductId = result.products[0].id;
      });

    await frisby
      .post(`${url}/sales/`, [
        {
          product_id: resultProductId,
          quantity: 2,
        },
      ])
      .expect('status', 200)
      .then((secondResponse) => {
        const { json } = secondResponse;
        const idFirstItenSold = json.itemsSold[0].product_id;
        const quantityFirstItenSold = json.itemsSold[0].quantity;
        expect(json).toHaveProperty('id');
        expect(idFirstItenSold).toBe(resultProductId);
        expect(quantityFirstItenSold).toBe(2);
      });
  });

  it('Será validado que é possível criar várias compras com sucesso', async () => {
    let result;
    let resultProductId;

    await frisby
      .get(`${url}/products/`)
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        result = JSON.parse(body);
        resultProductId = result.products[0].id;
      });

    await frisby
      .post(`${url}/sales/`, [
        {
          product_id: resultProductId,
          quantity: 2,
        },
        {
          product_id: resultProductId,
          quantity: 6,
        },
      ])
      .expect('status', 200)
      .then((secondResponse) => {
        const { json } = secondResponse;
        const idFirstItenSold = json.itemsSold[0].product_id;
        const quantityFirstItenSold = json.itemsSold[0].quantity;
        const idSecondItenSold = json.itemsSold[1].product_id;
        const quantitySecondItenSold = json.itemsSold[1].quantity;
        expect(json).toHaveProperty('id');
        expect(idFirstItenSold).toBe(resultProductId);
        expect(quantityFirstItenSold).toBe(2);
        expect(idSecondItenSold).toBe(resultProductId);
        expect(quantitySecondItenSold).toBe(6);
      });
  });
});

describe('6 - Crie um endpoint para listar as vendas', () => {
  const connection = mysql.createPool({
    host: process.env.MYSQL_HOST || 'mysql',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'password',
  });

  beforeEach(async () => {
    const values = products.map(({name, quantity}) => [name, quantity]);
    await connection.query(
      'INSERT INTO StoreManager.products (name, quantity) VALUES ?',
      [values],
    )
  });

  afterEach(async () => {
    await connection.execute('DELETE FROM StoreManager.products');
    await connection.execute('DELETE FROM StoreManager.sales');
    await connection.execute('DELETE FROM StoreManager.sales_products');
  });

  afterAll(async () => {
    await connection.end();
  });

  it('Será validado que todas as vendas estão sendo retornadas', async () => {
    let result;
    let resultFirstSale;
    let resultSecondSale;
    let resultFirstSaleId;
    let resultSecondSaleId;
    let firstProductId;
    let secondProductId;

    await frisby
      .get(`${url}/products/`)
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        result = JSON.parse(body);
        firstProductId = result.products[0].id;
        secondProductId = result.products[1].id;
      });

    await frisby
      .post(`${url}/sales/`, [
        {
          product_id: firstProductId,
          quantity: 2,
        },
        {
          product_id: secondProductId,
          quantity: 6,
        },
      ])
      .expect('status', 200)
      .then((responseSales) => {
        const { body } = responseSales;
        resultFirstSale = JSON.parse(body);
        resultFirstSaleId = resultFirstSale.id;
      });

      await frisby
      .post(`${url}/sales/`, [
        {
          product_id: firstProductId,
          quantity: 4,
        },
        {
          product_id: secondProductId,
          quantity: 3,
        },
      ])
      .expect('status', 200)
      .then((responseSales) => {
        const { body } = responseSales;
        resultSecondSale = JSON.parse(body);
        resultSecondSaleId = resultSecondSale.id;
      });

    await frisby
      .get(`${url}/sales/`)
      .expect('status', 200)
      .then((responseAll) => {
        const { body } = responseAll;
        const resultAllSales = JSON.parse(body);
        const firstSale = resultAllSales.sales[0];
        const secondSale = resultAllSales.sales[2];

        expect(resultAllSales.sales.length).toBe(4);
        expect(firstSale.id).toBe(resultFirstSaleId);
        expect(firstSale).toHaveProperty('date');
        expect(secondSale.id).toBe(resultSecondSaleId);
        expect(secondSale).toHaveProperty('date');
      });
  });

  it('Será validado que é possível listar uma determinada venda', async () => {
    let result;
    let resultSales;
    let firstProductId;
    let secondProductId;

    await frisby
      .get(`${url}/products/`)
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        result = JSON.parse(body);
        firstProductId = result.products[0].id;
        secondProductId = result.products[1].id;
      });

    await frisby
      .post(`${url}/sales/`, [
        {
          product_id: firstProductId,
          quantity: 2,
        },
        {
          product_id: secondProductId,
          quantity: 6,
        },
      ])
      .expect('status', 200)
      .then((responseSales) => {
        const { body } = responseSales;
        resultSales = JSON.parse(body);
      });

    await frisby
      .get(`${url}/sales/${resultSales.id}`)
      .expect('status', 200)
      .then((responseOne) => {
        const { body } = responseOne;
        const responseAll = JSON.parse(body);
        const saleIdFirstProduct = responseAll[0].id;
        const saleIdSecondProduct = responseAll[1].id;
        const productIdFirstProduct = responseAll[0].product_id;
        const productIdSecondProduct = responseAll[1].product_id;
        expect(responseAll.length).toBe(2);
        expect(saleIdFirstProduct).toBe(resultSales.id);
        expect(saleIdSecondProduct).toBe(resultSales.id);
        expect(productIdFirstProduct).toBe(firstProductId);
        expect(productIdSecondProduct).toBe(secondProductId);
      });
  });

  it('Será validado que não é possível listar uma venda inexistente', async () => {
    await frisby
      .get(`${url}/sales/${INVALID_ID}`)
      .expect('status', 404)
      .then((responseOne) => {
        const { body } = responseOne;
        const responseError = JSON.parse(body);
        expect(responseError.err.code).toEqual('not_found');
        expect(responseError.err.message).toEqual('Sale not found');
      });
  });
});

describe('7 - Crie um endpoint para atualizar uma venda', () => {
  const connection = mysql.createPool({
    host: process.env.MYSQL_HOST || 'mysql',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'password',
  });

  beforeEach(async () => {
    const values = products.map(({name, quantity}) => [name, quantity]);
    await connection.query(
      'INSERT INTO StoreManager.products (name, quantity) VALUES ?',
      [values],
    )
  });

  afterEach(async () => {
    await connection.execute('DELETE FROM StoreManager.products');
    await connection.execute('DELETE FROM StoreManager.sales');
    await connection.execute('DELETE FROM StoreManager.sales_products');
  });

  afterAll(async () => {
    await connection.end();
  });

  it('Será validado que não é possível atualizar vendas com quantidade menor que zero', async () => {
    let result;
    let resultProductId;
    let resultSales;
    let resultSalesId;

    await frisby
      .get(`${url}/products/`)
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        result = JSON.parse(body);
        resultProductId = result.products[0].id;
      });

    await frisby
      .post(`${url}/sales/`, [
        {
          product_id: resultProductId,
          quantity: 2,
        },
      ])
      .expect('status', 200)
      .then((responseSales) => {
        const { body } = responseSales;
        resultSales = JSON.parse(body);
        resultSalesId = resultSales.id;
      });

    await frisby
      .put(`${url}/sales/${resultSales.id}`, [
        {
          product_id: resultProductId,
          quantity: -1,
        },
      ])
      .expect('status', 422)
      .then((responseEdit) => {
        const { body } = responseEdit;
        const responseEditBody = JSON.parse(body);
        const error = responseEditBody.err.code;
        const { message } = responseEditBody.err;
        expect(error).toBe('invalid_data');
        expect(message).toBe('Wrong product ID or invalid quantity');
      });
  });

  it('Será validado que não é possível atualizar vendas com quantidade igual a zero', async () => {
    let result;
    let resultProductId;
    let resultSales;
    let resultSalesId;

    await frisby
      .get(`${url}/products/`)
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        result = JSON.parse(body);
        resultProductId = result.products[0].id;
      });

    await frisby
      .post(`${url}/sales/`, [
        {
          product_id: resultProductId,
          quantity: 2,
        },
      ])
      .expect('status', 200)
      .then((responseSales) => {
        const { body } = responseSales;
        resultSales = JSON.parse(body);
        resultSalesId = resultSales.id;
      });

    await frisby
      .put(`${url}/sales/${resultSalesId}`, [
        {
          product_id: resultProductId,
          quantity: 0,
        },
      ])
      .expect('status', 422)
      .then((responseEdit) => {
        const { body } = responseEdit;
        const responseEditBody = JSON.parse(body);
        const error = responseEditBody.err.code;
        const { message } = responseEditBody.err;
        expect(error).toBe('invalid_data');
        expect(message).toBe('Wrong product ID or invalid quantity');
      });
  });

  it('Será validado que não é possível atualizar vendas com uma string no campo quantidade', async () => {
    let result;
    let resultProductId;
    let resultSales;
    let resultSalesId;

    await frisby
      .get(`${url}/products/`)
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        result = JSON.parse(body);
        resultProductId = result.products[0].id;
      });

    await frisby
      .post(`${url}/sales/`, [
        {
          product_id: resultProductId,
          quantity: 2,
        },
      ])
      .expect('status', 200)
      .then((responseSales) => {
        const { body } = responseSales;
        resultSales = JSON.parse(body);
        resultSalesId = resultSales.id;
      });

    await frisby
      .put(`${url}/sales/${resultSalesId}`, [
        {
          product_id: resultProductId,
          quantity: 'String',
        },
      ])
      .expect('status', 422)
      .then((responseEdit) => {
        const { body } = responseEdit;
        const responseEditBody = JSON.parse(body);
        const error = responseEditBody.err.code;
        const { message } = responseEditBody.err;
        expect(error).toBe('invalid_data');
        expect(message).toBe('Wrong product ID or invalid quantity');
      });
  });

  it('Será validado que é possível atualizar uma venda com sucesso', async () => {
    let result;
    let resultProductId;
    let resultSales;
    let resultSalesId;

    await frisby
      .get(`${url}/products/`)
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        result = JSON.parse(body);
        resultProductId = result.products[0].id;
      });

    await frisby
      .post(`${url}/sales/`, [
        {
          product_id: resultProductId,
          quantity: 2,
        },
      ])
      .expect('status', 200)
      .then((responseSales) => {
        const { body } = responseSales;
        resultSales = JSON.parse(body);
        resultSalesId = resultSales.id;
      });

    await frisby
      .put(`${url}/sales/${resultSalesId}`, [
        {
          product_id: resultProductId,
          quantity: 5,
        },
      ])
      .expect('status', 200)
      .then((responseEdit) => {
        const { body } = responseEdit;
        const responseEditBody = JSON.parse(body);
        const salesId = parseInt(responseEditBody.id);
        const idProductSales = responseEditBody.itemsSold[0].product_id;
        const quantityProductSales = responseEditBody.itemsSold[0].quantity;
        expect(salesId).toBe(resultSalesId);
        expect(idProductSales).toBe(resultSales.itemsSold[0].product_id);
        expect(quantityProductSales).toBe(5);
      });
  });
});

describe('8 - Crie um endpoint para deletar uma venda', () => {
  const connection = mysql.createPool({
    host: process.env.MYSQL_HOST || 'mysql',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'password',
  });

  beforeEach(async () => {
    const values = products.map(({name, quantity}) => [name, quantity]);
    await connection.query(
      'INSERT INTO StoreManager.products (name, quantity) VALUES ?',
      [values],
    )
  });

  afterEach(async () => {
    await connection.execute('DELETE FROM StoreManager.products');
    await connection.execute('DELETE FROM StoreManager.sales');
    await connection.execute('DELETE FROM StoreManager.sales_products');
  });

  afterAll(async () => {
    await connection.end();
  });

  it('Será validado que é possível deletar uma venda com sucesso', async () => {
    let result;
    let resultSales;
    let resultProductId;
    let resultSalesId;

    await frisby
      .get(`${url}/products/`)
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        result = JSON.parse(body);
        resultProductId = result.products[0].id;
      });

    await frisby
      .post(`${url}/sales/`, [
        {
          product_id: resultProductId,
          quantity: 2,
        },
      ])
      .expect('status', 200)
      .then((responseSales) => {
        const { body } = responseSales;
        resultSales = JSON.parse(body);
        resultSalesId = resultSales.id;
      });

    await frisby.delete(`${url}/sales/${resultSalesId}`).expect('status', 200);

    await frisby
      .get(`${url}/sales/${resultSalesId}`)
      .expect('status', 404)
      .expect((resultGet) => {
        const { body } = resultGet;
        const resultGetBody = JSON.parse(body);
        const error = resultGetBody.err.code;
        const { message } = resultGetBody.err;
        expect(error).toBe('not_found');
        expect(message).toBe('Sale not found');
      });
  });

  it('Será validado que não é possível deletar uma venda que não existe', async () => {
    await frisby
      .delete(`${url}/sales/${INVALID_ID}`)
      .expect('status', 422)
      .expect((resultDelete) => {
        const { body } = resultDelete;
        const resultDeleteBody = JSON.parse(body);
        const error = resultDeleteBody.err.code;
        const { message } = resultDeleteBody.err;
        expect(error).toBe('invalid_data');
        expect(message).toBe('Wrong sale ID format');
      });
  });
});

describe('9 - Atualize a quantidade de produtos', () => {
  const connection = mysql.createPool({
    host: process.env.MYSQL_HOST || 'mysql',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'password',
  });

  beforeEach(async () => {
    const values = products.map(({name, quantity}) => [name, quantity]);
    await connection.query(
      'INSERT INTO StoreManager.products (name, quantity) VALUES ?',
      [values],
    )
  });

  afterEach(async () => {
    await connection.execute('DELETE FROM StoreManager.products');
    await connection.execute('DELETE FROM StoreManager.sales');
    await connection.execute('DELETE FROM StoreManager.sales_products');
  });

  afterAll(async () => {
    await connection.end();
  });

  it('Será validado que é possível a quantidade do produto atualize ao fazer uma compra', async () => {
    let result;
    let responseProductId;

    await frisby
      .get(`${url}/products/`)
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        result = JSON.parse(body);
        responseProductId = result.products[0].id;
      });

    await frisby
      .post(`${url}/sales/`, [
        {
          product_id: responseProductId,
          quantity: 2,
        },
      ])
      .expect('status', 200);

    await frisby
      .get(`${url}/products/${responseProductId}`)
      .expect('status', 200)
      .expect((responseProducts) => {
        const { body } = responseProducts;
        const resultProducts = JSON.parse(body);
        const quantityProducts = resultProducts.quantity;
        expect(quantityProducts).toBe(8);
      });
  });

  it('Será validado que é possível a quantidade do produto atualize ao deletar uma compra', async () => {
    let result;
    let resultSales;
    let responseProductId;
    let responseSalesId;

    await frisby
      .get(`${url}/products/`)
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        result = JSON.parse(body);
        responseProductId = result.products[0].id;
      });

    await frisby
      .post(`${url}/sales/`, [
        {
          product_id: responseProductId,
          quantity: 2,
        },
      ])
      .expect('status', 200)
      .then((responseSales) => {
        const { body } = responseSales;
        resultSales = JSON.parse(body);
        responseSalesId = resultSales.id;
      });

    await frisby.delete(`${url}/sales/${responseSalesId}`).expect('status', 200);

    await frisby
      .get(`${url}/products/${responseProductId}`)
      .expect('status', 200)
      .expect((responseProducts) => {
        const { body } = responseProducts;
        const resultProducts = JSON.parse(body);
        const quantityProducts = resultProducts.quantity;
        expect(quantityProducts).toBe(10);
      });
  });
});

describe('10 - Valide a quantidade de produtos', () => {
  const connection = mysql.createPool({
    host: process.env.MYSQL_HOST || 'mysql',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'password',
  });

  beforeEach(async () => {
    const values = products.map(({name, quantity}) => [name, quantity]);
    await connection.query(
      'INSERT INTO StoreManager.products (name, quantity) VALUES ?',
      [values],
    )
  });

  afterEach(async () => {
    await connection.execute('DELETE FROM StoreManager.products');
    await connection.execute('DELETE FROM StoreManager.sales');
    await connection.execute('DELETE FROM StoreManager.sales_products');
  });

  afterAll(async () => {
    await connection.end();
  });

  it('Será validado que o estoque do produto nunca fique com a quantidade menor que zero', async () => {
    let result;
    let responseProductId;

    await frisby
      .get(`${url}/products/`)
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        result = JSON.parse(body);
        responseProductId = result.products[0].id;
      });

    await frisby
      .post(`${url}/sales/`, [
        {
          product_id: responseProductId,
          quantity: 100,
        },
      ])
      .expect('status', 404)
      .then((responseSales) => {
        const { json } = responseSales;
        expect(json.err.code).toBe('stock_problem');
        expect(json.err.message).toBe('Such amount is not permitted to sell');
      });
  });
});
