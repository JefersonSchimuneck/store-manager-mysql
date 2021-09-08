const service = require('../services/productService');

const OK = 200;
const CREATED = 201;

async function create(req, res, next) {
  const { name, quantity } = req.body;
  const newProduct = await service.create(name, quantity);
  if (newProduct.error) return next(newProduct);
  res.status(CREATED).json(newProduct);
}

async function readAll(_req, res, _next) {
  const all = await service.readAll();
  res.status(OK).json({ products: all });
}

async function readById(req, res, next) {
  const { id } = req.params;
  const product = await service.readById(id);
  if (product.error) return next(product);
  res.status(OK).json(product);
}

async function update(req, res, next) {
  const { id } = req.params;
  const { name, quantity } = req.body;
  const updateProduct = await service.update(id, name, quantity);
  if (updateProduct.error) return next(updateProduct);
  res.status(OK).json(updateProduct);
}

async function destroy(req, res, next) {
  const { id } = req.params;
  const productDeleted = await service.destroy(id);
  if (productDeleted.error) return next(productDeleted);
  res.status(OK).json(productDeleted);
}

module.exports = {
  create,
  readAll,
  readById,
  update,
  destroy,
};
