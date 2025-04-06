### **Prueba Técnica Backend - Strapi v5**  
#### **Objetivo**  
Crear un proyecto de **Strapi** para gestionar los platos ofrecidos por un restaurante y permitir la creación y edición de menús diarios. Además, se debe implementar un cálculo automático del precio total de cada menú en función de los platos seleccionados.

---

#### **Configuración del Proyecto**  
1. Crear un proyecto de Strapi y nombrarlo como la BBDD, usando los siguientes parámetros de configuración:  

```
DATABASE_CLIENT=mysql  
DATABASE_HOST=192.168.0.62  
DATABASE_PORT=3306  
DATABASE_NAME=examen_1  
DATABASE_USERNAME=desarrollo  
DATABASE_PASSWORD=Alebat12358%  
DATABASE_SSL=false  
```

2. Crear un usuario administrador en Strapi.  
3. Instalar y configurar los plugins que solemos usar.  
4. Conectar Strapi con **CDN_URL=https://d33wusrb9waivf.cloudfront.net** para la gestión de imágenes.  

---

#### **Estructura de Datos**
**📌 Colección: Platos**
- **Foto**: Imagen del plato (tipo: Imagen).  
- **Nombre**: Nombre del plato (tipo: Texto).  
- **Precio**: Precio del plato (tipo: Número Decimal).  
- **Alergenos**: Relación con el componente `Alergeno` (ver abajo).  
- **Tipo**: Enumeración (`Primero`, `Segundo`, `Postre`).  

**📌 Componente: Alergeno**
Este componente permitirá gestionar mejor los alérgenos en lugar de un simple campo de texto.  
- **Nombre** (tipo: Texto).  
- **Descripción** (tipo: Texto).  
- **Icono** (tipo: Imagen).  

---

**📌 Colección: Menús Diarios**
- **Día**: Día del menú (tipo: Texto).  
- **Primero**: Relación con un plato de la colección `Platos`.  
- **Segundo**: Relación con un plato de la colección `Platos`.  
- **Postre**: Relación con un plato de la colección `Platos`.  
- **Precio**: Precio fijo del menú (tipo: Número Decimal).  
- **Sum_Precio**: Cálculo automático de la suma de los precios de los platos que forman el menú.  

---

### **Requisitos Técnicos**
#### **1️⃣ Lifecycle Hooks**
Implementar un **lifecycle hook** en la colección `MenusDiarios` que:  
- Calcule automáticamente `Sum_Precio` sumando los precios de los platos seleccionados.  
- **Valide** que un plato no se repita en varias categorías (Ej: No se puede usar el mismo plato como "Primero" y "Postre").  

---

#### **2️⃣ Servicios Personalizados**
Crear un servicio en `menu-service.js` que:  
- Obtenga los precios de los platos.   
- **Incluya impuestos** según el tipo de menú.  

Este servicio debe ser usado en el lifecycle hook de `MenusDiarios`.

---

#### **3️⃣ API Mejorada**
Se debe exponer una API pública en `MenusDiarios` con los siguientes endpoints:  
- **Hacer la consulta**
  - **Obtener solo los postres** dentro de los menús (`GET /menus/postres`).  
  - **Filtrar menús por rango de precios** (`GET /menus?min_precio=10&max_precio=20`).
  
- **Crear APIS**
  - **Filtrar menús sin ciertos alérgenos** (`GET /menus?excluir_alergenos=gluten,lactosa`).  
  - **Obtener los platos más vendidos o populares** (`GET /platos/populares`).  

Las respuestas deben estar optimizadas y estructuradas en formato JSON.

---

#### **4️⃣ Autenticación y Control de Acceso**
- Solo los **administradores** podrán crear y editar menús.  
- Los **usuarios normales** solo podrán consultar los menús.  
- Crear **roles personalizados** en Strapi para gestionar los permisos.  

---
