export default {
    routes: [
       {
        method: 'PUT',
        path: '/daily-menu/',
        handler: 'daily-menu.lessAllergens',
        config: {
          policies: [],
          middlewares: [],
        },
       },
    ],
};
  