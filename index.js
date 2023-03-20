import dotenv from "dotenv";
dotenv.config();
import mysql from "mysql";
import util from "util";
import axios from "axios";
import SimpleNodeLogger from "simple-node-logger";
import tz from "moment-timezone";
import moment from "moment";

import { getThemeId } from "./apiClient.js";

const mySecret = process.env["api-key"];
const dbPass = process.env["db-pass"];
const host = process.env["host"];
const user = process.env["user"];
const port = process.env["port"];
const apiLink = process.env["api-link"];
var date = moment.tz();
var dateToday = date.tz("Asia/Manila");
// var today = dateToday.format('YYYY-MM-DD HH:mm:ss');
var today = dateToday.format("2022-11-29 HH:mm:ss");
const promises = [];

//Log file
const opts = {
    logFilePath: "mylogfile.log",
    timestampFormat: dateToday.format("YYYY-MM-DD HH:mm:ss"),
  },
  log = SimpleNodeLogger.createSimpleLogger(opts);
//Log file

const conn = mysql.createConnection({
  host: host,
  user: user,
  port: port,
  password: dbPass,
});

// node native promisify
const query = util.promisify(conn.query).bind(conn);

export const run = async () => {
  try {
    const rows = await query("SELECT * FROM rustans_web_services.pr_promos");
    log.info("rows", rows);
    let promoBadges = [];
    let promoPlaceholder = [];
    for (let row of rows) {
      var promoMechanics = row["mechanics"];
      var promoBadge = row["badge"];
      var displayOn = row["displayOn"];
      var productBrand = row["displayOnValue"];
      var endDate = row["endDate"];
      var startDate = row["startDate"];
      var enabled = row["enabled"];

      //PROMO START DATE
      if (
        moment(today).format("YYYY-MM-DD") ==
        moment(startDate).format("YYYY-MM-DD")
      ) {
        //DISPLAY ON BRAND
        if (displayOn == "brand") {
          log.info("Promo Started - BRAND: " + productBrand);

          promoPlaceholder.push(
            `\n{% elsif product.vendor == "${productBrand}" %}\n  {% unless product.tag == 'GWP' %}\n    <p class="gwp-placeholder">${promoMechanics}</p>\n  {% endunless %}\n`
          );

          if (promoBadge == null || promoBadge == "With Exclusive Gift") {
            promoBadges.push(
              `\n{% elsif product.vendor == "${productBrand}"%}\n<div>\n <h6 class="product-badge--silver">With Exclusive Gift</h6>\n</div>\n`
            );
          } else if (promoBadge != null) {
            //Promo Badge Color----//
            if (
              promoBadge == "Available In-Store Only" ||
              promoBadge == "Gift With Purchase" ||
              promoBadge == "With Exclusive Gift" ||
              promoBadge == "Regular Essential Oil" ||
              promoBadge == "New Arrival" ||
              promoBadge == "Official Retailer"
            ) {
              let badgeColor = "silver";
              promoBadges.push(
                `\n{% elsif product.vendor == "${productBrand}"%}\n<div>\n <h6 class="product-badge--${badgeColor}">${promoBadge}</h6>\n</div>\n`
              );
            } else if (
              promoBadge == "Buy 1 Get 1" ||
              promoBadge == "Bundle Promo" ||
              promoBadge == "Introductory Offer"
            ) {
              let badgeColor = "red";
              promoBadges.push(
                `\n{% elsif product.vendor == "${productBrand}"%}\n<div>\n <h6 class="product-badge--${badgeColor}">${promoBadge}</h6>\n</div>\n`
              );
            } else if (
              promoBadge == "Free Shipping" ||
              promoBadge == "Premium Essential Oil" ||
              promoBadge == "Limited Edition" ||
              promoBadge == "Bestseller" ||
              promoBadge == "Shipping From Store" ||
              promoBadge == "Rustan's Exclusive" ||
              promoBadge == "Exclusive"
            ) {
              let badgeColor = "gold";
              promoBadges.push(
                `\n{% elsif product.vendor == "${productBrand}"%}\n<div>\n <h6 class="product-badge--${badgeColor}">${promoBadge}</h6>\n</div>\n`
              );
            }
            //Promo Badge Color----//

            //DISPLAY ON PRODUCT TAG
          }
        } else if (displayOn == "product_tag") {
          log.info("Promo Started - Product tag: " + productBrand);

          const promoID = row["id"];
          const productTag = row["displayOnValue"];
          let promoMechanics = row["mechanics"];
          let promoBadge = row["badge"];
          // let specialPromoBadge = row['Special Promo Badge'];
          promoPlaceholder.push(
            `\n{% elsif product.tags contains "${productTag}" %}\n  {% unless product.tag == 'GWP' %}\n    <p class="gwp-placeholder">${promoMechanics}</p>\n  {% endunless %}`
          );
          if (promoBadge == null) {
            promoBadges.push(
              `\n{% elsif product.tags contains "${productTag}"%}\n<div>\n <h6 class="product-badge--silver">With Exclusive Gift</h6>\n</div>\n`
            );
          } else if (promoBadge != null) {
            //Promo Badge Color----//
            if (
              promoBadge == "Available In-Store Only" ||
              promoBadge == "Gift With Purchase" ||
              promoBadge == "With Exclusive Gift" ||
              promoBadge == "Regular Essential Oil" ||
              promoBadge == "New Arrival" ||
              promoBadge == "Official Retailer"
            ) {
              let badgeColor = "silver";
              promoBadges.push(
                `\n{% elsif product.tags contains "${productTag}"%}\n<div>\n <h6 class="product-badge--${badgeColor}">${promoBadge}</h6>\n</div>\n`
              );
            } else if (
              promoBadge == "Buy 1 Get 1" ||
              promoBadge == "Bundle Promo" ||
              promoBadge == "Introductory Offer"
            ) {
              let badgeColor = "red";
              promoBadges.push(
                `\n{% elsif product.tags contains "${productTag}"%}\n<div>\n <h6 class="product-badge--${badgeColor}">${promoBadge}</h6>\n</div>\n`
              );
            } else if (
              promoBadge == "Free Shipping" ||
              promoBadge == "Premium Essential Oil" ||
              promoBadge == "Limited Edition" ||
              promoBadge == "Bestseller" ||
              promoBadge == "Shipping From Store" ||
              promoBadge == "Rustan's Exclusive" ||
              promoBadge == "Exclusive"
            ) {
              let badgeColor = "gold";
              promoBadges.push(
                `\n{% elsif product.tags contains "${productTag}"%}\n<div>\n <h6 class="product-badge--${badgeColor}">${promoBadge}</h6>\n</div>\n`
              );
            }
            //Promo Badge Color----//
          } else if (promoBadge != null && promoBadge == "Others") {
            promoBadges.push(
              `\n{% elsif product.tags contains "${productTag}"%}\n<div>\n <h6 class="product-badge--silver">${specialPromoBadge}</h6>\n</div>\n`
            );
          } else if (
            promoBadge == null &&
            field.fields["Special Promo Badge"] != null
          ) {
            promoBadges.push(
              `\n{% elsif product.tags contains "${productTag}"%}\n<div>\n <h6 class="product-badge--silver">${specialPromoBadge}</h6>\n</div>\n`
            );
          }
        }
        //PROMO END DATE
      } //else if(moment(today).format('YYYY-MM-DD') > moment(endDate).format('YYYY-MM-DD')) {
      //   var id = row["id"];

      //    const disable = await query("UPDATE rustans_web_services.pr_promos SET enabled = '0' WHERE endDate < '" + moment(today).format('YYYY-MM-DD') + "' and id = " + id + " ");
      //   console.log(moment(endDate).format('YYYY-MM-DD'));
      // }
      else if (
        enabled == 1 &&
        today > moment(startDate).format("YYYY-MM-DD HH:mm:ss") &&
        today < moment(endDate).format("YYYY-MM-DD HH:mm:ss")
      ) {
        console.log(enabled + " " + productBrand);
        //PRODUCT BRAND------------------
        if (displayOn == "brand") {
          const productBrand = row["displayOnValue"];
          let promoMechanics = row["mechanics"];
          let promoBadge = row["badge"];
          // let specialPromoBadge = field.fields['Special Promo Badge'];
          promoPlaceholder.push(
            `\n{% elsif product.vendor == "${productBrand}" %}\n  {% unless product.tag == 'GWP' %}\n    <p class="gwp-placeholder">${promoMechanics}</p>\n  {% endunless %}\n`
          );

          //Promo Badge Color----//
          if (
            promoBadge == "Available In-Store Only" ||
            promoBadge == "Gift With Purchase" ||
            promoBadge == "With Exclusive Gift" ||
            promoBadge == "Regular Essential Oil" ||
            promoBadge == "New Arrival" ||
            promoBadge == "Official Retailer"
          ) {
            let badgeColor = "silver";
            promoBadges.push(
              `\n{% elsif product.vendor == "${productBrand}"%}\n<div>\n <h6 class="product-badge--${badgeColor}">${promoBadge}</h6>\n</div>\n`
            );
          } else if (
            promoBadge == "Buy 1 Get 1" ||
            promoBadge == "Bundle Promo" ||
            promoBadge == "Introductory Offer"
          ) {
            let badgeColor = "red";
            promoBadges.push(
              `\n{% elsif product.vendor == "${productBrand}"%}\n<div>\n <h6 class="product-badge--${badgeColor}">${promoBadge}</h6>\n</div>\n`
            );
          } else if (
            promoBadge == "Free Shipping" ||
            promoBadge == "Premium Essential Oil" ||
            promoBadge == "Limited Edition" ||
            promoBadge == "Bestseller" ||
            promoBadge == "Shipping From Store" ||
            promoBadge == "Rustan's Exclusive" ||
            promoBadge == "Exclusive"
          ) {
            let badgeColor = "gold";
            promoBadges.push(
              `\n{% elsif product.vendor == "${productBrand}"%}\n<div>\n <h6 class="product-badge--${badgeColor}">${promoBadge}</h6>\n</div>\n`
            );
          }
          //Promo Badge Color----//

          //PRODUCT TAG------------------
        } else if (displayOn == "product_tag") {
          const productTag = row["displayOnValue"];
          let promoMechanics = row["mechanics"];
          let promoBadge = row["badge"];
          // let specialPromoBadge = field.fields['Special Promo Badge'];
          promoPlaceholder.push(
            `\n{% elsif product.tags contains "${productTag}" %}\n  {% unless product.tag == 'GWP' %}\n    <p class="gwp-placeholder">${promoMechanics}</p>\n  {% endunless %}`
          );

          //Promo Badge Color----//
          if (
            promoBadge == "Available In-Store Only" ||
            promoBadge == "Gift With Purchase" ||
            promoBadge == "With Exclusive Gift" ||
            promoBadge == "Regular Essential Oil" ||
            promoBadge == "New Arrival" ||
            promoBadge == "Official Retailer"
          ) {
            let badgeColor = "silver";
            promoBadges.push(
              `\n{% elsif product.tags contains "${productTag}"%}\n<div>\n <h6 class="product-badge--${badgeColor}">${promoBadge}</h6>\n</div>\n`
            );
          } else if (
            promoBadge == "Buy 1 Get 1" ||
            promoBadge == "Bundle Promo" ||
            promoBadge == "Introductory Offer"
          ) {
            let badgeColor = "red";
            promoBadges.push(
              `\n{% elsif product.tags contains "${productTag}"%}\n<div>\n <h6 class="product-badge--${badgeColor}">${promoBadge}</h6>\n</div>\n`
            );
          } else if (
            promoBadge == "Free Shipping" ||
            promoBadge == "Premium Essential Oil" ||
            promoBadge == "Limited Edition" ||
            promoBadge == "Bestseller" ||
            promoBadge == "Shipping From Store" ||
            promoBadge == "Rustan's Exclusive" ||
            promoBadge == "Exclusive"
          ) {
            let badgeColor = "gold";
            promoBadges.push(
              `\n{% elsif product.tags contains "${productTag}"%}\n<div>\n <h6 class="product-badge--${badgeColor}">${promoBadge}</h6>\n</div>\n`
            );
          }
          //Promo Badge Color----//
        }
      }
    }

    //----->GET THE CURRENT THEME//
    const themeIDs = await getThemeId()
      .then((data) => {
        console.log("getThemeID() success");
        return data;
      })
      .catch((err) => {
        console.log("getThemeId() failed", err);
      });

    let currentThemeID = "";
    let role = "";
    for (let themeID of themeIDs) {
      //***themeID.role == 'main'
      try {
        if (themeID.role == "main") {
          currentThemeID = themeID.id;
          role = themeID.role;
        }
      } catch (err) {
        log.info("Incorrect themeID" + err);
      }
    }
    const lastestThemes = themeIDs.sort(dynamicSort("-updated_at")).slice(0, 3);
    const themeToUpdateIds = [
      currentThemeID,
      ...lastestThemes.map((theme) => theme.id),
    ];
    //GET THE CURRENT THEME<-----//
    const badges = promoBadges.join("");
    const badge = `{% if product.tags contains 'freegift'%}\n<div>\n <h6 class="product-badge--silver">With Exclusive Gift</h6>\n</div>\n${badges}\n\n{% else %}\n{% include 'new-promo-badge2' %}\n\n{% endif %}`;
    log.info("badges", badges);
    const mechanics = promoPlaceholder.join("");
    log.info("mechanics", mechanics);
    const mechanicsTemplate = `{% if product.vendor == 'undefined' %}\n  {% unless product.tag == 'GWP' %}\n    <p class="gwp-placeholder"></p>\n  {% endunless %}\n${mechanics}\n\n\n{% endif %}`;
    log.info("themeToUpdateIds:", themeToUpdateIds);
    for (const themeId of themeToUpdateIds) {
      promises.push(addPromoBadges(themeId, badge));
      promises.push(newPromoPlaceholder(themeId, mechanicsTemplate));
    }
    const promiseResults = await Promise.allSettled(promises);
    log.info("promiseResults:", promiseResults);
  } catch (err) {
    log.error("Error", err);
  } finally {
    conn.end();
  }
};

const addPromoBadges = async (themeId, badge) => {
  //***https://rustanscom.myshopify.com/admin
  // log.info("badge:", badge);
  const response = await axios.put(
    `${apiLink}/themes/${themeId}/assets.json`,
    {
      asset: {
        key: "snippets/new-promo-badge.liquid",
        value: `${badge}`,
      },
    },
    {
      headers: {
        "X-Shopify-Access-Token": mySecret,
        "Content-Type": "application/json;charset=UTF-8",
      },
    }
  );
  // log.info("Promo Badge Added", response.data);
  return response;
};

const newPromoPlaceholder = async (themeId, mechanicsTemplate) => {
  // log.info("mechanicsTemplate", mechanicsTemplate);
  //***https://rustanscom.myshopify.com/admin
  const response = await axios.put(
    `${apiLink}/themes/${themeId}/assets.json`,
    {
      asset: {
        key: "snippets/new-promo-placeholder.liquid",
        value: `${mechanicsTemplate}`,
      },
    },
    {
      headers: {
        "X-Shopify-Access-Token": mySecret,
        "Content-Type": "application/json;charset=UTF-8",
      },
    }
  );
  // log.info("Placeholder Added", response.data);
  return response;
};

function dynamicSort(property) {
  let sortOrder = 1;
  if (property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }
  return function (a, b) {
    /* next line works with strings and numbers,
     * and you may want to customize it to your needs
     */
    const result = moment(a[property]).isBefore(moment(b[property]))
      ? -1
      : moment(a[property]).isAfter(moment(b[property]))
      ? 1
      : 0;
    return result * sortOrder;
  };
}

run();
