import type { Schema, Struct } from '@strapi/strapi';

export interface AllergensAllergens extends Struct.ComponentSchema {
  collectionName: 'components_allergens_allergens';
  info: {
    displayName: 'Allergens';
    icon: 'information';
  };
  attributes: {
    Description: Schema.Attribute.Text;
    Icon: Schema.Attribute.Media<'images' | 'files', true>;
    Name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'allergens.allergens': AllergensAllergens;
    }
  }
}
