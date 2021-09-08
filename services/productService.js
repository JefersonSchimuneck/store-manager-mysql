const Joi = require('@hapi/joi');

const model = require('../models/productModel');

const UNPROCESSABLE_ENTITY = 422;
const MIN_NAME_LENGTH = 5;
const productSchema = Joi.object({
  name: Joi.string().min(MIN_NAME_LENGTH).required(),
  quantity: Joi.number().min(1).required(),
});

async function create(name, quantity) {
  const { error } = productSchema.validate({ name, quantity });

  if (error) { 
    return {
      status: UNPROCESSABLE_ENTITY,
      code: 'invalid_data',
      error
    };
  };

  const allProducts = await readAll();
  const isNameUsed = allProducts.some(product => product.name === name);

  if (isNameUsed) {
    return {
      status: UNPROCESSABLE_ENTITY,
      code: 'invalid_data',
      error: { message: 'Product already exists' }
    };
  }

  const newProduct = model.create(name, quantity);
  return newProduct;
};

async function readAll() {
  const products = await model.readAll();
  return products;
}

async function readById(id) {
  const product = await model.readById(id);

  if (!product) {
    return {
      status: UNPROCESSABLE_ENTITY,
      code: 'invalid_data',
      error: { message: 'Wrong id format' },
    };
  }

  return product;
}

async function update(id, name, quantity) {
  const { error } = productSchema.validate({ name, quantity });

  if (error) { 
    return {
      status: UNPROCESSABLE_ENTITY,
      code: 'invalid_data',
      error,
    };
  }

  const updateProduct = await model.update(id, name, quantity);
  return updateProduct;
}

async function destroy(id) {
  const productDeleted = await model.destroy(id);

  if (!productDeleted) {
    return {
      status: UNPROCESSABLE_ENTITY,
      code: 'invalid_data',
      error: { message: 'Wrong id format' },
    };
  }
  
  return productDeleted;
}

module.exports = {
  create,
  readAll,
  readById,
  update,
  destroy,
};
