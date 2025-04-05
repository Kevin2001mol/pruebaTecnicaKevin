//import {dailyMenuUtils} from '../../../../utils/CreateUpdate.ts';
const DAYLE_SERVE = "api::daily-menu.daily-menu";
const { errors } = require("@strapi/utils");
const { ApplicationError } = errors;
module.exports = {
    async afterCreate(event) {
        var _a;
        if ((_a = event.state) === null || _a === void 0 ? void 0 : _a.isCalculatedUpdate)
            return;
        const { params, result } = event;
        const dishes = await strapi.documents(DAYLE_SERVE).findOne({
            documentId: result.documentId,
            populate: { First: true, MainCourse: true, Dessert: true },
        });
        const { TotalPriceDishes, documentId, PriceTaxes } = dishes;
        const sumPrice = await strapi.service(DAYLE_SERVE).showPrices(dishes);
        const price_with_taxes = await strapi.service(DAYLE_SERVE).addTaxes(dishes);
        // Asigna 0 en caso de que sea null
        const currentPrice = TotalPriceDishes !== null && TotalPriceDishes !== void 0 ? TotalPriceDishes : 0;
        const calculatedPrice = sumPrice !== null && sumPrice !== void 0 ? sumPrice : 0;
        if (currentPrice.toFixed(2) !== calculatedPrice.toFixed(2)) {
            setTimeout(async () => {
                await strapi.documents(DAYLE_SERVE).update({
                    documentId,
                    data: { TotalPriceDishes: sumPrice },
                    state: { isCalculatedUpdate: true },
                });
                console.log("Actualización de TotalPriceDishes completada (afterCreate)");
            }, 100);
        }
        const currentTaxes = typeof PriceTaxes === "number" ? PriceTaxes : parseFloat(PriceTaxes) || 0;
        const calculatedTaxes = typeof price_with_taxes === "number"
            ? price_with_taxes
            : parseFloat(price_with_taxes) || 0;
        if (currentTaxes.toFixed(2) !== calculatedTaxes.toFixed(2)) {
            setTimeout(async () => {
                await strapi.documents(DAYLE_SERVE).update({
                    documentId,
                    data: { PriceTaxes: price_with_taxes },
                    state: { isCalculatedUpdate: true },
                });
                console.log("Actualización de PriceTaxes completada (afterCreate)");
            }, 100);
        }
    },
    async afterUpdate(event) {
        if (event.state.isCalculatedUpdate)
            return;
        // Si se está publicando, se suele enviar 'publishedAt'
        if (event.params.data && event.params.data.publishedAt) {
            console.warn("Publish action detected, skipping calculated update in afterUpdate.");
            return;
        }
        const { params, result } = event;
        const dishes = await strapi.documents(DAYLE_SERVE).findOne({
            documentId: result.documentId,
            populate: { First: true, MainCourse: true, Dessert: true },
        });
        if (!dishes.First || !dishes.MainCourse || !dishes.Dessert) {
            console.warn("Missing dish information in menu, skipping calculated update.");
            return;
        }
        const { TotalPriceDishes, documentId, PriceTaxes } = dishes;
        const sumPrice = await strapi.service(DAYLE_SERVE).showPrices(dishes);
        console.log("Después de update de TotalPriceDishes");
        if (TotalPriceDishes.toFixed(2) !== sumPrice.toFixed(2)) {
            setTimeout(async () => {
                try {
                    await strapi.documents(DAYLE_SERVE).update({
                        documentId,
                        data: { TotalPriceDishes: sumPrice },
                        state: { isCalculatedUpdate: true },
                    });
                    console.log("Actualización de TotalPriceDishes completada (afterUpdate)");
                }
                catch (error) {
                    console.error("Error updating TotalPriceDishes:", error);
                }
            }, 100);
        }
        const price_with_taxes = await strapi.service(DAYLE_SERVE).addTaxes(dishes);
        const currentTaxes = typeof PriceTaxes === "number" ? PriceTaxes : parseFloat(PriceTaxes) || 0;
        const calculatedTaxes = typeof price_with_taxes === "number"
            ? price_with_taxes
            : parseFloat(price_with_taxes) || 0;
        if (currentTaxes.toFixed(2) !== calculatedTaxes.toFixed(2)) {
            setTimeout(async () => {
                try {
                    await strapi.documents(DAYLE_SERVE).update({
                        documentId,
                        data: { PriceTaxes: price_with_taxes },
                        state: { isCalculatedUpdate: true },
                    });
                    console.log("Actualización de PriceTaxes completada (afterUpdate)");
                }
                catch (error) {
                    console.error("Error updating PriceTaxes:", error);
                }
            }, 100);
        }
    },
    async beforeCreate(event) {
        if (event.state.isCalculatedUpdate)
            return;
        const { params } = event;
        // Si no se reciben datos de las relaciones, omite la validación.
        if (!params.data.First && !params.data.MainCourse && !params.data.Dessert) {
            return;
        }
        const { First, MainCourse, Dessert } = params.data;
        if (!First || !MainCourse || !Dessert) {
            throw new ApplicationError("Missing dish information in menu");
        }
        const firstId = getId(First);
        const mainId = getId(MainCourse);
        const dessertId = getId(Dessert);
        if (!firstId || !mainId || !dessertId) {
            throw new ApplicationError("Missing dish information in menu");
        }
        console.log("First:", firstId);
        console.log("MainCourse:", mainId);
        console.log("Dessert:", dessertId);
        console.log("First mio :", First);
        console.log("MainCourse mio:", MainCourse);
        console.log("Dessert mio :", Dessert);
        if (firstId === mainId) {
            throw new ApplicationError("The same dish cannot be used as First and MainCourse");
        }
        if (firstId === dessertId) {
            throw new ApplicationError("The same dish cannot be used as First and Dessert");
        }
        if (mainId === dessertId) {
            throw new ApplicationError("The same dish cannot be used as MainCourse and Dessert");
        }
        // Normaliza la estructura para que Strapi la procese correctamente
        params.data.First = [firstId];
        params.data.MainCourse = [mainId];
        params.data.Dessert = [dessertId];
    },
    async beforeUpdate(event) {
        var _a, _b, _c;
        if (event.state.isCalculatedUpdate)
            return;
        // Si se está publicando, normalmente se setea el campo publishedAt
        if (event.params.data && event.params.data.publishedAt) {
            console.warn("Publish action detected, skipping dish validation.");
            return;
        }
        const { params } = event;
        const menu = await strapi.db.query(DAYLE_SERVE).findOne({
            where: { id: params.where.id },
            populate: { First: true, MainCourse: true, Dessert: true },
        });
        if (!menu) {
            throw new ApplicationError("Menu not found");
        }
        // Verificar que las relaciones existan y tengan id
        if (!((_a = menu.First) === null || _a === void 0 ? void 0 : _a.id) || !((_b = menu.MainCourse) === null || _b === void 0 ? void 0 : _b.id) || !((_c = menu.Dessert) === null || _c === void 0 ? void 0 : _c.id)) {
            console.warn("Missing dish information in menu during update, skipping validation.");
            return;
        }
        if (menu.First.id === menu.MainCourse.id) {
            throw new ApplicationError("The same dish cannot be used as First and MainCourse");
        }
        if (menu.First.id === menu.Dessert.id) {
            throw new ApplicationError("The same dish cannot be used as First and Dessert");
        }
        if (menu.MainCourse.id === menu.Dessert.id) {
            throw new ApplicationError("The same dish cannot be used as MainCourse and Dessert");
        }
    },
};
const getId = (field) => {
    // Si es un número, ya es el id
    if (typeof field === "number")
        return field;
    // Si es un objeto y tiene un array "connect" válido
    if (typeof field === "object" &&
        field.connect &&
        Array.isArray(field.connect) &&
        field.connect.length > 0 &&
        field.connect[0].id) {
        return field.connect[0].id;
    }
    // Si es un objeto y tiene un array "set" válido
    if (typeof field === "object" &&
        field.set &&
        Array.isArray(field.set) &&
        field.set.length > 0 &&
        field.set[0].id) {
        return field.set[0].id;
    }
    // Si el objeto ya posee la propiedad "id"
    if (typeof field === "object" && field.id)
        return field.id;
    return null;
};
