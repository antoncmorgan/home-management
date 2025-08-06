# Meal Planning Epic

## Overview
This epic introduces a comprehensive meal planning feature for the home management system, supporting family-wide dinner planning, individual lunch planning, and robust inventory and grocery list management.

---


## Meal Plan Backend Checklist

- [ ] Rename `meals` table and model to `dishes` (add `dishType` for entree/side/dessert/other, and `timeOfDay` for breakfast/lunch/dinner)
- [ ] Create `food_items` table/model for all individual food items
- [ ] Update `meal_plans` table to remove direct meal references
- [ ] Create `meal_plan_dishes` join table to associate multiple dishes with a meal plan
- [ ] Create `meal_plan_food_items` join table to associate food items (including packed items for members) with a meal plan
- [ ] Implement CRUD functions for dishes, food items, meal plans, and join tables in the DB module
- [ ] Implement async helpers for DB-backed CRUD for dishes, food items, meal plans, and join tables
- [ ] Implement API endpoints for dishes, food items, meal plans, and join tables (GET, POST, PUT, DELETE)
- [ ] Add existence checks for update and delete routes
- [ ] Map DB results from snake_case to camelCase in API responses
- [ ] Write and update tests for DB-backed helpers and routes
- [ ] Ensure proper error handling and status codes in all endpoints
- [ ] Permission checks:
  - [ ] Check family membership before allowing access to meal plans and related data
  - [ ] Return 403 if user is not a member
  - [ ] Apply checks to all sensitive routes (GET, POST, PUT, DELETE)

## List Backend Checklist

 - [x] Create a generic `lists` table (with type: food, freezer, grocery) and `list_items` table (item details, quantity, status, etc.) to support all list types
 - [x] Implement CRUD functions for lists and list items in the DB module
 - [x] Implement async helpers for DB-backed CRUD for lists and list items
 - [x] Implement API endpoints for lists and list items (GET, POST, PUT, DELETE)
 - [x] Permission checks:
   - [x] Check family membership before allowing access to lists (owner check for list items implemented)
   - [x] Return 403 if user is not a member (owner check for list items implemented)
   - [x] Apply checks to all sensitive routes (GET, POST, PUT, DELETE) (for list items)

---

## Frontend Tasks

 - [ ] Create models/interfaces for Meal, MealPlan, List (with type), and ListItem (used for food, freezer, and grocery lists) in the client.
 - [ ] Build a meal planner view (calendar/grid for dinner/lunch planning).
 - [ ] Build a collapsible docked (right-side) meal detail view:
     - Shows image, ingredients, cook time, and recipe.
 - [ ] Build distinct views/components for Available Ingredients, Freezer, and Grocery List, each representing a concept in the UI but all managed using the generic list model.
 - [ ] Implement add/edit forms for meals, lists, and list items.
 - [ ] Fetch and manage meals, meal plans, lists, and list items state.
 - [ ] Integrate API calls for fetching, adding, editing, and deleting meals, plans, lists, and list items.
 - [ ] Ensure authenticated user info is managed separately from meal planning data.
 - [ ] Add visual indicators for meal type (dinner/lunch) and assigned family member(s).

---

## UX Goals
- Easy navigation between meal planning, inventory, and grocery lists.
- Clickable meals open docked detail view with all relevant info.
- Simple add/edit flows for all lists.
- Focus on primary ingredients for inventory (not minor items like spices).

---

This epic covers the main steps for implementing and integrating the meal planning feature in both backend and frontend.
