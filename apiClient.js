import SimpleNodeLogger from "simple-node-logger";
import axios from "axios";
// const apiLink = process.env["api-link"];
// //'https://rustanscom-dev.myshopify.com/admin/api/2022-07
// const mySecret = process.env["api-key"];
// const mySecretAirtable = process.env["airtableAPI-key"];

//Log file
const opts = {
    logFilePath: "mylogfile.log",
    timestampFormat: "YYYY-MM-DD HH:mm:ss.SSS",
  },
  log = SimpleNodeLogger.createSimpleLogger(opts);
//Log file

//Fetch Theme ID's--------
export const getThemeId = async () => {
  const apiLink = process.env["api-link"];
  const mySecret = process.env["api-key"];
  const response = await axios.get(`${apiLink}/themes.json`, {
    headers: { "X-Shopify-Access-Token": mySecret },
  });
  const themeId = Object.values(response.data.themes);

  return themeId;
};
//Fetch Fetch Theme ID's--------
