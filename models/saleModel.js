const connection = require('./connection');

async function create(itemsSold) {
  const newSale =  await connection.execute(
    'INSERT INTO StoreManager.sales VALUES ()'
  );
  const { insertId: id } = newSale[0];
  const values = itemsSold.map(item => [id, item.product_id, item.quantity]);
  await connection.query(
    'INSERT INTO StoreManager.sales_products VALUES ?',
    [values],
  );
  return { id, itemsSold };
}

async function readAll() {
  const [sales] = await connection.execute(
    `SELECT t1.*, t2.product_id, t2.quantity
    FROM StoreManager.sales AS t1
    INNER JOIN StoreManager.sales_products AS t2
    ON t1.id = t2.sale_id
    ORDER BY id`
  );
  return sales;
}

async function readById(id) {
  const [sale] = await connection.execute(
    `SELECT t1.*, t2.product_id, t2.quantity
    FROM StoreManager.sales AS t1
    INNER JOIN StoreManager.sales_products AS t2
    ON t1.id = t2.sale_id
    WHERE id = '${id}'`
  );
  if (!sale.length) return null;
  return { sale };
}

async function update(id, itemUpdated) {
  await connection.execute(
    `UPDATE StoreManager.sales_products
    SET quantity = '${itemUpdated[0].quantity}'
    WHERE sale_id = '${id}' AND product_id = '${itemUpdated[0].product_id}'`
  );
  return { id: parseInt(id), itemUpdated };
}

async function destroy(id) {
  const deletedSale = await readById(id);
  await connection.execute(
    `DELETE FROM StoreManager.sales
    WHERE id = '${id}'`
  );
  return deletedSale;
}

module.exports = {
  create,
  readAll,
  readById,
  update,
  destroy,
};
