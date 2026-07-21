
const db = require("./database.js");
const d = db.exportData();
const items = JSON.parse(d).items;
console.log("Total items:", items.length);
console.log("First 3 items images:");
items.slice(0, 3).forEach(i => console.log(i.name, "->", JSON.stringify(i.images)));
