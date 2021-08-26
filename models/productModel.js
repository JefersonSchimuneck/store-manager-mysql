const { ObjectId } = require('mongodb');
const connection = require('./connection');

async function create(name, quantity) {
  const db = await connection();
  const newProduct = await db.collection('products').insertOne({ name, quantity });

  return newProduct.ops[0];
}

async function readAll() {
  const db = await connection();
  const products = await db.collection('products').find().toArray();

  return products;
}

async function readById(id) {
  if (!ObjectId.isValid(id)) return null;

  const db = await connection();
  const product = await db.collection('products').findOne(ObjectId(id));

  if (!product) return null;

  return product;
}

async function update(id, name, quantity) {
  if (!ObjectId.isValid(id)) return null;

  const db = await connection();
  const updateProduct = await db.collection('products')
    .findOneAndUpdate(
      { _id: ObjectId(id) },
      { $set: { name, quantity } }, 
      { returnOriginal: false}
    );

  if (!updateProduct) return null;

  return updateProduct.value;
}

async function destroy(id) {
  if (!ObjectId.isValid(id)) return null;

  const productDeleted = await readById(id);
  const db = await connection();
  await db.collection('products').deleteOne({ _id: ObjectId(id) });
  
  return productDeleted;
}

module.exports = {
  create,
  readAll,
  readById,
  update,
  destroy,
};
