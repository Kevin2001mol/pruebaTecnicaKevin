"use strict";
/**
 * daily-menu service
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
const DAILY_MENU_SERVE = "api::daily-menu.daily-menu";
const PLATE_SERVE = "api::dish.dish";
exports.default = strapi_1.factories.createCoreService(DAILY_MENU_SERVE, () => ({
    async showPrices(ctx) {
        const { First, MainCourse, Dessert } = ctx;
        let first_dish = 0;
        let second_dish = 0;
        let third_dish = 0;
        if (First != null) {
            first_dish = First.Price;
        }
        if (MainCourse != null) {
            second_dish = MainCourse.Price;
        }
        if (Dessert != null) {
            third_dish = Dessert.Price;
        }
        return first_dish + second_dish + third_dish;
    },
    async addTaxes(ctx) {
        const TAXES = 1.21;
        const { Price } = ctx;
        return (Price * TAXES).toFixed(2);
    },
    checkPublishAction(event) {
        if (event.params.data && event.params.data.publishedAt) {
            throw new ApplicationError("Publish action detected, skipping calculated update in afterUpdate.");
        }
    },
    checkDishInformation(dishes) {
        if (!dishes.First || !dishes.MainCourse || !dishes.Dessert) {
            throw new ApplicationError("Missing dish information in menu, skipping calculated update.");
        }
    },
    async updateFieldIfDifferent(documentId, fieldName, currentValue, newValue) {
        if (currentValue.toFixed(2) !== newValue.toFixed(2)) {
            try {
                const data = {};
                data[fieldName] = newValue;
                await strapi.documents(DAILY_MENU_SERVE).update({
                    documentId,
                    data,
                    state: { isCalculatedUpdate: true },
                });
            }
            catch (error) {
                throw new ApplicationError(`Error updating ${fieldName}: ${error.message}`);
            }
        }
    },
    async validateCategory(params) {
        const validateFirst = await checkDishCategory(params.data.First, "First");
        if (!validateFirst)
            return { isValid: false, errorCode: 1 };
        const validateSecond = await checkDishCategory(params.data.MainCourse, "MainCourse");
        if (!validateSecond)
            return { isValid: false, errorCode: 2 };
        const validateDessert = await checkDishCategory(params.data.Dessert, "Dessert");
        if (!validateDessert)
            return { isValid: false, errorCode: 3 };
        return { isValid: true, errorCode: 0 };
    },
}));
const checkDishCategory = async (dishData, categoryType) => {
    if (dishData &&
        Array.isArray(dishData.connect) &&
        dishData.connect.length > 0) {
        const dish = await strapi.db.query(PLATE_SERVE).findOne({
            where: { id: dishData.connect.map((item) => item.id) },
        });
        return dish.Type === categoryType;
    }
    return true;
};
