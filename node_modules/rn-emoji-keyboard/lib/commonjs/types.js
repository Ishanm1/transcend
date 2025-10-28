"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CATEGORIES_NAVIGATION = exports.CATEGORIES = void 0;
const CATEGORIES_NAVIGATION = [{
  icon: 'Smile',
  category: 'smileys_emotion'
}, {
  icon: 'Users',
  category: 'people_body'
}, {
  icon: 'Trees',
  category: 'animals_nature'
}, {
  icon: 'Pizza',
  category: 'food_drink'
}, {
  icon: 'Plane',
  category: 'travel_places'
}, {
  icon: 'Football',
  category: 'activities'
}, {
  icon: 'Lightbulb',
  category: 'objects'
}, {
  icon: 'Ban',
  category: 'symbols'
}, {
  icon: 'Flag',
  category: 'flags'
}, {
  icon: 'Clock',
  category: 'recently_used'
}, {
  icon: 'Search',
  category: 'search'
}];
exports.CATEGORIES_NAVIGATION = CATEGORIES_NAVIGATION;
const CATEGORIES = CATEGORIES_NAVIGATION.map(_ref => {
  let {
    category
  } = _ref;
  return category;
});
exports.CATEGORIES = CATEGORIES;
//# sourceMappingURL=types.js.map