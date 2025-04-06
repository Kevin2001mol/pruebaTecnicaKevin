const DAYLE_SERVE = "api::daily-menu.daily-menu";
const { errors } = require("@strapi/utils");
const { ApplicationError } = errors;
module.exports = {
  async afterCreate(event) {
    if (event.state?.isCalculatedUpdate) return;
    const { result } = event;
    const dishes = await strapi.documents(DAYLE_SERVE).findOne({
      documentId: result.documentId,
      populate: { First: true, MainCourse: true, Dessert: true },
    });
    const { TotalPriceDishes, documentId, PriceTaxes } = dishes;
    const sumPrice = await strapi.service(DAYLE_SERVE).showPrices(dishes);
    const price_with_taxes = await strapi.service(DAYLE_SERVE).addTaxes(dishes);
    const currentPrice = TotalPriceDishes ?? 0;
    const calculatedPrice = sumPrice ?? 0;
    await strapi
      .service(DAYLE_SERVE)
      .updateFieldIfDifferent(
        documentId,
        "TotalPriceDishes",
        currentPrice,
        calculatedPrice
      );
    const currentTaxes =
      typeof PriceTaxes === "number" ? PriceTaxes : parseFloat(PriceTaxes) || 0;
    const calculatedTaxes =
      typeof price_with_taxes === "number"
        ? price_with_taxes
        : parseFloat(price_with_taxes) || 0;
    await strapi
      .service(DAYLE_SERVE)
      .updateFieldIfDifferent(
        documentId,
        "PriceTaxes",
        currentTaxes,
        calculatedTaxes
      );
  },
  async afterUpdate(event) {
    if (event.state?.isCalculatedUpdate) return;
    await strapi.service(DAYLE_SERVE).checkPublishAction(event);

    const { result } = event;
    const dishes = await strapi.documents(DAYLE_SERVE).findOne({
      documentId: result.documentId,
      populate: { First: true, MainCourse: true, Dessert: true },
    });

    await strapi.service(DAYLE_SERVE).checkDishInformation(dishes);

    const { TotalPriceDishes, documentId, PriceTaxes } = dishes;
    const sumPrice = await strapi.service(DAYLE_SERVE).showPrices(dishes);

    await strapi
      .service(DAYLE_SERVE)
      .updateFieldIfDifferent(
        documentId,
        "TotalPriceDishes",
        TotalPriceDishes,
        sumPrice
      );

    const price_with_taxes = await strapi.service(DAYLE_SERVE).addTaxes(dishes);
    const currentTaxes =
      typeof PriceTaxes === "number" ? PriceTaxes : parseFloat(PriceTaxes) || 0;
    const calculatedTaxes =
      typeof price_with_taxes === "number"
        ? price_with_taxes
        : parseFloat(price_with_taxes) || 0;

    await strapi
      .service(DAYLE_SERVE)
      .updateFieldIfDifferent(
        documentId,
        "PriceTaxes",
        currentTaxes,
        calculatedTaxes
      );
  },
  async beforeCreate(event) {
    const { params } = event;
    const validCategory = await strapi
      .service(DAYLE_SERVE)
      .validateCategory(params);
    handleCategoryError(validCategory);
  },
  async beforeUpdate(event) {
    const { params } = event;
    const validCategory = await strapi
      .service(DAYLE_SERVE)
      .validateCategory(params);
    handleCategoryError(validCategory);
  },
};
const getId = (field) => {
  if (Array.isArray(field)) {
    return getId(field[0]);
  }
  if (typeof field === "number") return field;
  if (
    typeof field === "object" &&
    field.connect &&
    Array.isArray(field.connect) &&
    field.connect.length > 0 &&
    field.connect[0].id
  ) {
    return field.connect[0].id;
  }
  if (
    typeof field === "object" &&
    field.set &&
    Array.isArray(field.set) &&
    field.set.length > 0 &&
    field.set[0].id
  ) {
    return field.set[0].id;
  }
  if (typeof field === "object" && field.id) return field.id;
  return null;
};
const handleCategoryError = (validCategory) => {
  if (!validCategory.isValid) {
    let errorMessage = "";
    switch (validCategory.errorCode) {
      case 1:
        errorMessage = "Warning! The first dish is not in its category.";
        break;
      case 2:
        errorMessage = "Warning! The main course is not in its category.";
        break;
      case 3:
        errorMessage = "Warning! The dessert is not in its category.";
        break;
      default:
        errorMessage = "Warning! There is a dish empty.";
        break;
    }
    throw new ApplicationError(errorMessage);
  }
};
