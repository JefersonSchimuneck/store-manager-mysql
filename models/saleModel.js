const { ObjectId } = require('mongodb');
const connection = require('./connection');

async function create(items) {
  const db = await connection();
  const newSale = await db.collection('sales').insertOne({ itensSold: items });

  return newSale.ops[0];
}

async function readAll() {
  const db = await connection();
  const sales = await db.collection('sales').find().toArray();

  return sales;
}

async function readById(id) {
  if (!ObjectId.isValid(id)) return null;

  const db = await connection();
  const sale = await db.collection('sales').findOne(ObjectId(id));

  if (!sale) return null;

  return sale;
}

async function update(id, item) {
  if (!ObjectId.isValid(id)) return null;

  const db = await connection();
  const updateSale = await db.collection('sales')
    .findOneAndUpdate(
      { _id: ObjectId(id) },
      { $set: { itensSold: item } }, 
      { returnOriginal: false}
    );

  if (!updateSale) return null;

  return updateSale.value;
}

async function destroy(id) {
  if (!ObjectId.isValid(id)) return null;

  const saleDeleted = await readById(id);
  const db = await connection();
  await db.collection('sales').deleteOne({ _id: ObjectId(id) });
  
  return saleDeleted;
}

module.exports = {
  create,
  readAll,
  readById,
  update,
  destroy,
};
