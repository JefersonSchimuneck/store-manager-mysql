const connection = require('./connection');

async function create(name, quantity) {
  const newProduct =  await connection.execute(
    `INSERT INTO StoreManager.products (name, quantity)
    VALUES ('${name}', '${quantity}')`
  );
  const { insertId: id } = newProduct[0];
  return { id, name, quantity };
}

async function readAll() {
  const [products] = await connection.execute(
    'SELECT * FROM StoreManager.products',
  );
  return products;
}

async function readById(id) {
  const [product] = await connection.execute(
    `SELECT * FROM StoreManager.products
    WHERE id ='${id}'`
  );
  if (!product.length) return null;
  return product[0];
}

async function update(id, name, quantity) {
  await connection.execute(
    `UPDATE StoreManager.products
    SET name = '${name}', quantity = '${quantity}'
    WHERE id = '${id}'`
  );
  return { id: parseInt(id), name, quantity };
}

async function destroy(id) {
  const deletedProduct = await readById(id);
  await connection.execute(
    `DELETE FROM StoreManager.products
    WHERE id = '${id}'`
  );
  return deletedProduct;
}

module.exports = {
  create,
  readAll,
  readById,
  update,
  destroy,
};
