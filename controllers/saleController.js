const service = require('../services/saleService');

const OK = 200;

async function create(req, res, next) {
  const itemsSold = req.body;
  const newSale = await service.create(itemsSold);
  if (newSale.error) return next(newSale);
  res.status(OK).json(newSale);
}

async function readAll(_req, res, _next) {
  const all = await service.readAll();
  res.status(OK).json({ sales: all });
}

async function readById(req, res, next) {
  const { id } = req.params;
  const sale = await service.readById(id);
  if (sale.error) return next(sale);
  res.status(OK).json(sale);
}

async function update(req, res, next) {
  const { id } = req.params;
  const item = req.body;
  const updateSale = await service.update(id, item);
  if (updateSale.error) return next(updateSale);
  res.status(OK).json(updateSale);
}

async function destroy(req, res, next) {
  const { id } = req.params;
  const saleDeleted = await service.destroy(id);
  if (saleDeleted.error) return next(saleDeleted);
  res.status(OK).json(saleDeleted);
}

module.exports = {
  create,
  readAll,
  readById,
  update,
  destroy,
};
