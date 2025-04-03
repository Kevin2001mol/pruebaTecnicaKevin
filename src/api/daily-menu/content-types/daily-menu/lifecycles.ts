//import {dailyMenuUtils} from '../../../../utils/CreateUpdate.ts';
module.exports = {
  async afterUpdate(event) {
    const DAYLE_SERVE = "api::daily-menu.daily-menu";
    const { result } = event;

    const dishes = await strapi.documents(DAYLE_SERVE).findOne({
      documentId: result.documentId,
      populate: {
        First: true,
        MainCourse: true,
        Dessert: true,
      },
    });

    const sumPrice = await strapi.service(DAYLE_SERVE).showPrices(dishes);

    const price_bbdd = await strapi.documents(DAYLE_SERVE).findOne({
      documentId: result.documentId,
      fields: ["TotalPriceDishes"],
    });

    if (price_bbdd.TotalPriceDishes !== sumPrice) {
      await strapi.documents(DAYLE_SERVE).update({
        documentId: result.documentId,

        data: {
          TotalPriceDishes: sumPrice,
        },
      });
    }
  },
  async afterCreate(event){

  },
};
//falta segundo punto
