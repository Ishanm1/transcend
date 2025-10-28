export const CATEGORIES_NAVIGATION = [{
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
export const CATEGORIES = CATEGORIES_NAVIGATION.map(_ref => {
  let {
    category
  } = _ref;
  return category;
});
//# sourceMappingURL=types.js.map