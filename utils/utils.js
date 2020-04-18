const excludeFindFields = (query) => ({
  ...query,
  page: undefined,
  sort: undefined,
  limit: undefined,
  undefined,
  fields: undefined,
});

module.exports = { excludeFindFields };
