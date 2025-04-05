/**
 * daily-menu controller
 */

import { factories } from "@strapi/strapi";
const DAILYSERVE = "api::daily-menu.daily-menu";
export default factories.createCoreController(DAILYSERVE, () => ({
  async lessAllergens(ctx) {
    const { Name } = ctx.params;
    if (!Name) {
      return ctx.badRequest(
        "Debe proporcionar al menos un nombre de alérgeno."
      );
    }

    const namesArray = Name.split(",").map((name) => name.trim());
    //convertir en funcion obtainDishes();
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
    // hacer funcion menuFilter()
    const filteredMenus = dailyMenus.filter((menu) => {
      const dishHasProhibitedAllergen = (dish) => {
        if (!dish) return false;
        if (!dish.Allergens || dish.Allergens.length === 0) return false;
        return dish.Allergens.some((allergen) =>
          namesArray.includes(allergen.Name)
        );
      };

      const firstHas = dishHasProhibitedAllergen(menu.First);
      const mainCourseHas = dishHasProhibitedAllergen(menu.MainCourse);
      const dessertHas = dishHasProhibitedAllergen(menu.Dessert);

      return !firstHas && !mainCourseHas && !dessertHas;
    });
    //hasta aqui diria 
    return ctx.send(filteredMenus);
  },
  async mostPopulars(ctx) {
    // otra funcion nameDishes()
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
    //va metiendo counts es un mapa y hacerlo en funcion tmbn  countDishes()
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
    // funcion para ordenar e intentar simplificarla dishesSorter();
    const sortedDishes = Array.from(dishCountMap.entries())
      .sort((a, b) => b[1] - a[1])//ORDEN DE MAYOR A MENOR(SI LA RESTA DA NEGATIVO , LO ORDENA A LA INVERSD Y SI NO ASI )
      .map(([name, count]) => ({ name, count }));//CONVERTIR EN OBJ CON ATT DE NOMBRE Y CONTADOR 
    return { popularDishes: sortedDishes };
  },

}));
