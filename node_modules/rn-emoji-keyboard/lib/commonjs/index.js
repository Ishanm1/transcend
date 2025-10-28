"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "EmojiKeyboard", {
  enumerable: true,
  get: function () {
    return _EmojiKeyboard.EmojiKeyboard;
  }
});
Object.defineProperty(exports, "cs", {
  enumerable: true,
  get: function () {
    return _cs.default;
  }
});
Object.defineProperty(exports, "de", {
  enumerable: true,
  get: function () {
    return _de.default;
  }
});
exports.emojisByCategory = exports.default = void 0;
Object.defineProperty(exports, "en", {
  enumerable: true,
  get: function () {
    return _en.default;
  }
});
Object.defineProperty(exports, "es", {
  enumerable: true,
  get: function () {
    return _es.default;
  }
});
Object.defineProperty(exports, "fr", {
  enumerable: true,
  get: function () {
    return _fr.default;
  }
});
Object.defineProperty(exports, "id", {
  enumerable: true,
  get: function () {
    return _id.default;
  }
});
Object.defineProperty(exports, "it", {
  enumerable: true,
  get: function () {
    return _it.default;
  }
});
Object.defineProperty(exports, "ja", {
  enumerable: true,
  get: function () {
    return _ja.default;
  }
});
Object.defineProperty(exports, "ko", {
  enumerable: true,
  get: function () {
    return _ko.default;
  }
});
Object.defineProperty(exports, "no", {
  enumerable: true,
  get: function () {
    return _no.default;
  }
});
Object.defineProperty(exports, "np", {
  enumerable: true,
  get: function () {
    return _np.default;
  }
});
Object.defineProperty(exports, "pl", {
  enumerable: true,
  get: function () {
    return _pl.default;
  }
});
Object.defineProperty(exports, "pt", {
  enumerable: true,
  get: function () {
    return _pt.default;
  }
});
Object.defineProperty(exports, "ro", {
  enumerable: true,
  get: function () {
    return _ro.default;
  }
});
Object.defineProperty(exports, "ru", {
  enumerable: true,
  get: function () {
    return _ru.default;
  }
});
Object.defineProperty(exports, "se", {
  enumerable: true,
  get: function () {
    return _se.default;
  }
});
Object.defineProperty(exports, "tr", {
  enumerable: true,
  get: function () {
    return _tr.default;
  }
});
Object.defineProperty(exports, "ua", {
  enumerable: true,
  get: function () {
    return _ua.default;
  }
});
Object.defineProperty(exports, "useRecentPicksPersistence", {
  enumerable: true,
  get: function () {
    return _useRecentPicksPersistence.useRecentPicksPersistence;
  }
});
Object.defineProperty(exports, "vi", {
  enumerable: true,
  get: function () {
    return _vi.default;
  }
});
var _EmojiPicker = require("./EmojiPicker");
var _EmojiKeyboard = require("./EmojiKeyboard");
var _useRecentPicksPersistence = require("./hooks/useRecentPicksPersistence");
var _en = _interopRequireDefault(require("./translation/en"));
var _pl = _interopRequireDefault(require("./translation/pl"));
var _ko = _interopRequireDefault(require("./translation/ko"));
var _it = _interopRequireDefault(require("./translation/it"));
var _fr = _interopRequireDefault(require("./translation/fr"));
var _id = _interopRequireDefault(require("./translation/id"));
var _es = _interopRequireDefault(require("./translation/es"));
var _de = _interopRequireDefault(require("./translation/de"));
var _pt = _interopRequireDefault(require("./translation/pt"));
var _ru = _interopRequireDefault(require("./translation/ru"));
var _ua = _interopRequireDefault(require("./translation/ua"));
var _vi = _interopRequireDefault(require("./translation/vi"));
var _cs = _interopRequireDefault(require("./translation/cs"));
var _ja = _interopRequireDefault(require("./translation/ja"));
var _tr = _interopRequireDefault(require("./translation/tr"));
var _no = _interopRequireDefault(require("./translation/no"));
var _ro = _interopRequireDefault(require("./translation/ro"));
var _np = _interopRequireDefault(require("./translation/np"));
var _se = _interopRequireDefault(require("./translation/se"));
var _emojis = _interopRequireDefault(require("./assets/emojis.json"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const emojisByCategory = _emojis.default;
exports.emojisByCategory = emojisByCategory;
var _default = _EmojiPicker.EmojiPicker;
exports.default = _default;
//# sourceMappingURL=index.js.map