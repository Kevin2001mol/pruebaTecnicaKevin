"use strict";
/**
 * daily-menu controller
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
const DAILYSERVE = "api::daily-menu.daily-menu";
exports.default = strapi_1.factories.createCoreController(DAILYSERVE, () => ({
    async lessAllergens(ctx) {
        const { Name } = ctx.params;
        if (!Name) {
            return ctx.badRequest("Debe proporcionar al menos un nombre de alérgeno.");
        }
        const namesArray = Name.split(",").map((name) => name.trim());
        const dailyMenus = await strapi.documents(DAILYSERVE).findMany({
            populate: {
                First: {
                    populate: {
                        Allergens: true,
                    },
                },
                MainCourse: {
                    populate: {
                        Allergens: true,
                    },
                },
                Dessert: {
                    populate: {
                        Allergens: true,
                    },
                },
            },
        });
        const filteredMenus = dailyMenus.filter((menu) => {
            const dishHasProhibitedAllergen = (dish) => {
                if (!dish)
                    return false;
                if (!dish.Allergens || dish.Allergens.length === 0)
                    return false;
                return dish.Allergens.some((allergen) => namesArray.includes(allergen.Name));
            };
            const firstHas = dishHasProhibitedAllergen(menu.First);
            const mainCourseHas = dishHasProhibitedAllergen(menu.MainCourse);
            const dessertHas = dishHasProhibitedAllergen(menu.Dessert);
            return !firstHas && !mainCourseHas && !dessertHas;
        });
        return ctx.send(filteredMenus);
    },
    async mostPopulars(ctx) {
        const collections = await strapi.documents(DAILYSERVE).findMany({
            populate: {
                First: {
                    fields: ["Name"],
                },
                MainCourse: {
                    fields: ["Name"],
                },
                Dessert: {
                    fields: ["Name"],
                },
            },
        });
        const dishCountMap = getDishCountMap(collections);
        return getSortedDishes(dishCountMap);
    },
}));
function getDishCountMap(collections) {
    const dishCountMap = new Map();
    for (let i = 0; i < collections.length; i++) {
        const menu = collections[i];
        if (menu.First && menu.First.Name) {
            const dishName = menu.First.Name;
            dishCountMap.set(dishName, (dishCountMap.get(dishName) || 0) + 1);
        }
        if (menu.MainCourse && menu.MainCourse.Name) {
            const dishName = menu.MainCourse.Name;
            dishCountMap.set(dishName, (dishCountMap.get(dishName) || 0) + 1);
        }
        if (menu.Dessert && menu.Dessert.Name) {
            const dishName = menu.Dessert.Name;
            dishCountMap.set(dishName, (dishCountMap.get(dishName) || 0) + 1);
        }
    }
    return dishCountMap;
}
function getSortedDishes(dishCountMap) {
    const sortedDishes = Array.from(dishCountMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }));
    return { popularDishes: sortedDishes };
}
