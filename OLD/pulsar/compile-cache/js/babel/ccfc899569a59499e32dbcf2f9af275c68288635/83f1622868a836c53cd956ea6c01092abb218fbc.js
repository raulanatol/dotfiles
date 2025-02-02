'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isString = exports.isFunction = void 0;
const isFunction = value => isType(value, 'function');
exports.isFunction = isFunction;
const isString = value => isType(value, 'string');
exports.isString = isString;
const isType = (value, typeName) => {
  const t = typeof value;
  if (t == null) {
    return false;
  }
  return t === typeName;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpc0Z1bmN0aW9uIiwidmFsdWUiLCJpc1R5cGUiLCJpc1N0cmluZyIsInR5cGVOYW1lIiwidCJdLCJzb3VyY2VzIjpbInR5cGUtaGVscGVycy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5jb25zdCBpc0Z1bmN0aW9uID0gdmFsdWUgPT4gaXNUeXBlKHZhbHVlLCAnZnVuY3Rpb24nKVxuXG5jb25zdCBpc1N0cmluZyA9IHZhbHVlID0+IGlzVHlwZSh2YWx1ZSwgJ3N0cmluZycpXG5cbmNvbnN0IGlzVHlwZSA9ICh2YWx1ZSwgdHlwZU5hbWUpID0+IHtcbiAgY29uc3QgdCA9IHR5cGVvZiB2YWx1ZVxuICBpZiAodCA9PSBudWxsKSB7IHJldHVybiBmYWxzZSB9XG4gIHJldHVybiB0ID09PSB0eXBlTmFtZVxufVxuXG5leHBvcnQgeyBpc0Z1bmN0aW9uLCBpc1N0cmluZyB9XG4iXSwibWFwcGluZ3MiOiJBQUFBLFdBQVc7O0FBQUE7RUFBQTtBQUFBO0FBQUE7QUFFWCxNQUFNQSxVQUFVLEdBQUdDLEtBQUssSUFBSUMsTUFBTSxDQUFDRCxLQUFLLEVBQUUsVUFBVSxDQUFDO0FBQUE7QUFFckQsTUFBTUUsUUFBUSxHQUFHRixLQUFLLElBQUlDLE1BQU0sQ0FBQ0QsS0FBSyxFQUFFLFFBQVEsQ0FBQztBQUFBO0FBRWpELE1BQU1DLE1BQU0sR0FBRyxDQUFDRCxLQUFLLEVBQUVHLFFBQVEsS0FBSztFQUNsQyxNQUFNQyxDQUFDLEdBQUcsT0FBT0osS0FBSztFQUN0QixJQUFJSSxDQUFDLElBQUksSUFBSSxFQUFFO0lBQUUsT0FBTyxLQUFLO0VBQUM7RUFDOUIsT0FBT0EsQ0FBQyxLQUFLRCxRQUFRO0FBQ3ZCLENBQUMifQ==