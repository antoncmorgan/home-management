# Meal Planning Epic

## Overview
This epic introduces a comprehensive meal planning feature for the home management system, supporting family-wide dinner planning, individual lunch planning, and robust inventory and grocery list management.

---


## Meal Plan Backend Checklist

- [x] Create `meals` table in the database (name, type, image, ingredients, cook time, recipe, etc.)
- [x] Create `meal_plans` table to link meals to dates, family, and members (dinner/lunch, who, when)
- [x] Implement CRUD functions for meals and meal plans in the DB module
- [x] Implement async helpers for DB-backed CRUD for meals and meal plans
- [x] Implement API endpoints for meals and meal plans (GET, POST, PUT, DELETE)
- [x] Add existence checks for update and delete routes
- [x] Map DB results from snake_case to camelCase in API responses
- [x] Write and update tests for DB-backed helpers and routes
- [x] Ensure proper error handling and status codes in all endpoints
- [ ] Permission checks:
  - [ ] Check family membership before allowing access to meal plans
  - [ ] Return 403 if user is not a member
  - [ ] Apply checks to all sensitive routes (GET, POST, PUT, DELETE)

## List Backend Checklist

- [ ] Create a generic `lists` table (with type: food, freezer, grocery) and `list_items` table (item details, quantity, status, etc.) to support all list types
- [ ] Implement CRUD functions for lists and list items in the DB module
- [ ] Implement async helpers for DB-backed CRUD for lists and list items
- [ ] Implement API endpoints for lists and list items (GET, POST, PUT, DELETE)
- [ ] Permission checks:
  - [ ] Check family membership before allowing access to lists
  - [ ] Return 403 if user is not a member
  - [ ] Apply checks to all sensitive routes (GET, POST, PUT, DELETE)

---

## Frontend Tasks

1. Create models/interfaces for Meal, MealPlan, List (with type), and ListItem (used for food, freezer, and grocery lists) in the client.
2. Build a meal planner view (calendar/grid for dinner/lunch planning).
3. Build a docked (right-side) meal detail view:
   - Shows image, ingredients, cook time, and recipe.
4. Build distinct views/components for Available Ingredients, Freezer, and Grocery List, each representing a concept in the UI but all managed using the generic list model.
5. Implement add/edit forms for meals, lists, and list items.
6. Fetch and manage meals, meal plans, lists, and list items state.
7. Integrate API calls for fetching, adding, editing, and deleting meals, plans, lists, and list items.
8. Ensure authenticated user info is managed separately from meal planning data.
9. Add visual indicators for meal type (dinner/lunch) and assigned family member(s).

---

## UX Goals
- Easy navigation between meal planning, inventory, and grocery lists.
- Clickable meals open docked detail view with all relevant info.
- Simple add/edit flows for all lists.
- Focus on primary ingredients for inventory (not minor items like spices).

---

This epic covers the main steps for implementing and integrating the meal planning feature in both backend and frontend.
