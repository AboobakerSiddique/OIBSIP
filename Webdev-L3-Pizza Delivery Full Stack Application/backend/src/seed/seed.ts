import mongoose from "mongoose";
import { env } from "../config/env";
import { Pizza } from "../models/Pizza";
import { InventoryItem } from "../models/InventoryItem";
import { Admin } from "../models/Admin";
import { hashPassword } from "../utils/password";

const PIZZAS = [
  {
    name: "Margherita '90",
    description: "San Marzano tomato, fresh mozzarella, basil, olive oil.",
    price: 9.5,
    category: "Classic" as const,
    toppings: ["Tomato", "Mozzarella", "Basil"],
  },
  {
    name: "Quattro Formaggi",
    description: "Mozzarella, gorgonzola, parmesan, and fontina.",
    price: 12,
    category: "Classic" as const,
    toppings: ["Mozzarella", "Gorgonzola", "Parmesan", "Fontina"],
  },
  {
    name: "Diavola",
    description: "Spicy salami, arrabbiata sauce, chili flakes, mozzarella.",
    price: 11.5,
    category: "Signature" as const,
    toppings: ["Salami", "Arrabbiata", "Chili", "Mozzarella"],
  },
  {
    name: "Bella Special",
    description: "Our 1990 original — pepperoni, mushroom, olive, pepper.",
    price: 13,
    category: "Signature" as const,
    toppings: ["Pepperoni", "Mushroom", "Olive", "Pepper"],
  },
  {
    name: "Giardiniera",
    description: "Roasted vegetables, pesto, cherry tomato, mozzarella.",
    price: 10.5,
    category: "Vegetarian" as const,
    toppings: ["Pesto", "Vegetables", "Cherry Tomato", "Mozzarella"],
  },
  {
    name: "Funghi e Tartufo",
    description: "Wild mushroom, truffle oil, parmesan, thyme.",
    price: 13.5,
    category: "Vegetarian" as const,
    toppings: ["Mushroom", "Truffle Oil", "Parmesan"],
  },
];

const BASES = [
  { name: "Classic Hand-Tossed", addOnPrice: 0 },
  { name: "Thin & Crispy", addOnPrice: 0 },
  { name: "Whole Wheat", addOnPrice: 0.5 },
  { name: "Cheese-Stuffed Crust", addOnPrice: 1.5 },
  { name: "Focaccia Style", addOnPrice: 1 },
];

const SAUCES = [
  { name: "San Marzano Tomato", addOnPrice: 0 },
  { name: "Basil Pesto", addOnPrice: 0.75 },
  { name: "Garlic White Sauce", addOnPrice: 0.75 },
  { name: "Smoky BBQ", addOnPrice: 0.5 },
  { name: "Spicy Arrabbiata", addOnPrice: 0.5 },
];

const CHEESES = [
  { name: "Fresh Mozzarella", addOnPrice: 0 },
  { name: "Aged Parmesan", addOnPrice: 0.5 },
  { name: "Gorgonzola", addOnPrice: 1 },
  { name: "Vegan Cheese", addOnPrice: 1 },
];

const VEGETABLES = [
  { name: "Red Onion", addOnPrice: 0.3 },
  { name: "Bell Pepper", addOnPrice: 0.3 },
  { name: "Mushroom", addOnPrice: 0.4 },
  { name: "Black Olives", addOnPrice: 0.3 },
  { name: "Baby Spinach", addOnPrice: 0.3 },
  { name: "Cherry Tomato", addOnPrice: 0.3 },
  { name: "Jalapeño", addOnPrice: 0.3 },
  { name: "Sweet Corn", addOnPrice: 0.3 },
];

async function seed() {
  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI must be set to run the seed script");
  }

  await mongoose.connect(env.MONGODB_URI);
  console.log("[seed] Connected to MongoDB");

  await Promise.all([
    Pizza.deleteMany({}),
    InventoryItem.deleteMany({}),
    Admin.deleteMany({}),
  ]);
  console.log("[seed] Cleared existing pizzas, inventory, and admin accounts");

  await Pizza.insertMany(PIZZAS);
  console.log(`[seed] Inserted ${PIZZAS.length} pizzas`);

  const inventoryDocs = [
    ...BASES.map((b) => ({
      ...b,
      category: "Pizza Bases" as const,
      quantity: 40,
      threshold: 15,
      unit: "units",
    })),
    ...SAUCES.map((s) => ({
      ...s,
      category: "Sauces" as const,
      quantity: 25,
      threshold: 10,
      unit: "kg",
    })),
    ...CHEESES.map((c) => ({
      ...c,
      category: "Cheeses" as const,
      quantity: 20,
      threshold: 8,
      unit: "kg",
    })),
    ...VEGETABLES.map((v) => ({
      ...v,
      category: "Vegetables" as const,
      quantity: 15,
      threshold: 6,
      unit: "kg",
    })),
  ];

  await InventoryItem.insertMany(inventoryDocs);
  console.log(`[seed] Inserted ${inventoryDocs.length} inventory items`);

  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  await Admin.create({
    name: "Bella Pizza Admin",
    email: "admin@bellapizza.test",
    password: await hashPassword(adminPassword),
  });
  console.log("[seed] Created admin account: admin@bellapizza.test");
  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.log(
      "[seed] Using default dev password 'ChangeMe123!' — set SEED_ADMIN_PASSWORD to override"
    );
  }

  await mongoose.disconnect();
  console.log("[seed] Done");
}

seed().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});
