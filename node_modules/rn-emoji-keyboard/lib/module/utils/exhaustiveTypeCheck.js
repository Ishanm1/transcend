export const exhaustiveTypeCheck = function (arg) {
  let strict = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  console.log(`unhandled union case for : ${arg}`);
  if (strict) {
    throw new Error(`unhandled union case for : ${arg}`);
  }
};
//# sourceMappingURL=exhaustiveTypeCheck.js.map