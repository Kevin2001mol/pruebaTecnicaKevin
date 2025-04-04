//import {dailyMenuUtils} from '../../../../utils/CreateUpdate.ts';
module.exports = {
    async afterUpdate(event) {
        const DAYLE_SERVE = "api::daily-menu.daily-menu";
        const { params, result } = event;
        const dishes = await strapi.documents(DAYLE_SERVE).findOne({
            documentId: result.documentId,
            populate: {
                First: true,
                MainCourse: true,
                Dessert: true,
            },
        });
        const { TotalPriceDishes, documentId, PriceTaxes, Price } = dishes;
        const sumPrice = await strapi.service(DAYLE_SERVE).showPrices(dishes);
        //const total = await strapi.service(API_DAILY).priceDailyMenu(daily);
        if (TotalPriceDishes !== sumPrice) {
            const change = await strapi.documents(DAYLE_SERVE).update({
                documentId: documentId,
                data: {
                    TotalPriceDishes: sumPrice,
                },
            });
        }
        const price_with_taxes = await strapi.service(DAYLE_SERVE).addTaxes(dishes);
        if (price_with_taxes != PriceTaxes) {
            const changePrice = await strapi.documents(DAYLE_SERVE).update({
                documentId: documentId,
                data: {
                    PriceTaxes: price_with_taxes,
                },
            });
        }
    },
    async beforeUpdate(event) {
        if (event.state.isCalculatedUpdate) {
            return; // Si es una actualización calculada, no hacemos nada
        }
        const { errors } = require("@strapi/utils");
        const { ApplicationError } = errors;
        const DAYLY_SERVE_UID = "api::daily-menu.daily-menu";
        const { params } = event;
        const menu = await strapi.db.query(DAYLY_SERVE_UID).findOne({
            where: {
                id: params.where.id,
            },
            populate: {
                First: true,
                MainCourse: true,
                Dessert: true,
            }
        });
        const { First, MainCourse, Dessert } = menu;
        if (First.id === MainCourse.id) {
            throw new ApplicationError("El mismo plato no se puede usar como Primero y MainCourse");
        }
        if (First.id === Dessert.id) {
            throw new ApplicationError("El mismo plato no se puede usar como Primero y Postre");
        }
        if (MainCourse.id === Dessert.id) {
            throw new ApplicationError("El mismo plato no se puede usar como MainCourse y Postre");
        }
    },
};
