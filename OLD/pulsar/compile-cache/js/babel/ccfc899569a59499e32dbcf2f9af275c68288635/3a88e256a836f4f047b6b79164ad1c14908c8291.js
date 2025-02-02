"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/** @babel */

class ReporterProxy {
  constructor() {
    this.reporter = null;
    this.queue = [];
    this.eventType = 'welcome-v1';
  }
  setReporter(reporter) {
    this.reporter = reporter;
    let customEvent;
    while (customEvent = this.queue.shift()) {
      this.reporter.addCustomEvent(this.eventType, customEvent);
    }
  }
  sendEvent(action, label, value) {
    const event = {
      ea: action,
      el: label,
      ev: value
    };
    if (this.reporter) {
      this.reporter.addCustomEvent(this.eventType, event);
    } else {
      this.queue.push(event);
    }
  }
}
exports.default = ReporterProxy;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZXBvcnRlclByb3h5IiwiY29uc3RydWN0b3IiLCJyZXBvcnRlciIsInF1ZXVlIiwiZXZlbnRUeXBlIiwic2V0UmVwb3J0ZXIiLCJjdXN0b21FdmVudCIsInNoaWZ0IiwiYWRkQ3VzdG9tRXZlbnQiLCJzZW5kRXZlbnQiLCJhY3Rpb24iLCJsYWJlbCIsInZhbHVlIiwiZXZlbnQiLCJlYSIsImVsIiwiZXYiLCJwdXNoIl0sInNvdXJjZXMiOlsicmVwb3J0ZXItcHJveHkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBiYWJlbCAqL1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXBvcnRlclByb3h5IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5yZXBvcnRlciA9IG51bGw7XG4gICAgdGhpcy5xdWV1ZSA9IFtdO1xuICAgIHRoaXMuZXZlbnRUeXBlID0gJ3dlbGNvbWUtdjEnO1xuICB9XG5cbiAgc2V0UmVwb3J0ZXIocmVwb3J0ZXIpIHtcbiAgICB0aGlzLnJlcG9ydGVyID0gcmVwb3J0ZXI7XG4gICAgbGV0IGN1c3RvbUV2ZW50O1xuXG4gICAgd2hpbGUgKChjdXN0b21FdmVudCA9IHRoaXMucXVldWUuc2hpZnQoKSkpIHtcbiAgICAgIHRoaXMucmVwb3J0ZXIuYWRkQ3VzdG9tRXZlbnQodGhpcy5ldmVudFR5cGUsIGN1c3RvbUV2ZW50KTtcbiAgICB9XG4gIH1cblxuICBzZW5kRXZlbnQoYWN0aW9uLCBsYWJlbCwgdmFsdWUpIHtcbiAgICBjb25zdCBldmVudCA9IHsgZWE6IGFjdGlvbiwgZWw6IGxhYmVsLCBldjogdmFsdWUgfTtcbiAgICBpZiAodGhpcy5yZXBvcnRlcikge1xuICAgICAgdGhpcy5yZXBvcnRlci5hZGRDdXN0b21FdmVudCh0aGlzLmV2ZW50VHlwZSwgZXZlbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnF1ZXVlLnB1c2goZXZlbnQpO1xuICAgIH1cbiAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7QUFFZSxNQUFNQSxhQUFhLENBQUM7RUFDakNDLFdBQVcsR0FBRztJQUNaLElBQUksQ0FBQ0MsUUFBUSxHQUFHLElBQUk7SUFDcEIsSUFBSSxDQUFDQyxLQUFLLEdBQUcsRUFBRTtJQUNmLElBQUksQ0FBQ0MsU0FBUyxHQUFHLFlBQVk7RUFDL0I7RUFFQUMsV0FBVyxDQUFDSCxRQUFRLEVBQUU7SUFDcEIsSUFBSSxDQUFDQSxRQUFRLEdBQUdBLFFBQVE7SUFDeEIsSUFBSUksV0FBVztJQUVmLE9BQVFBLFdBQVcsR0FBRyxJQUFJLENBQUNILEtBQUssQ0FBQ0ksS0FBSyxFQUFFLEVBQUc7TUFDekMsSUFBSSxDQUFDTCxRQUFRLENBQUNNLGNBQWMsQ0FBQyxJQUFJLENBQUNKLFNBQVMsRUFBRUUsV0FBVyxDQUFDO0lBQzNEO0VBQ0Y7RUFFQUcsU0FBUyxDQUFDQyxNQUFNLEVBQUVDLEtBQUssRUFBRUMsS0FBSyxFQUFFO0lBQzlCLE1BQU1DLEtBQUssR0FBRztNQUFFQyxFQUFFLEVBQUVKLE1BQU07TUFBRUssRUFBRSxFQUFFSixLQUFLO01BQUVLLEVBQUUsRUFBRUo7SUFBTSxDQUFDO0lBQ2xELElBQUksSUFBSSxDQUFDVixRQUFRLEVBQUU7TUFDakIsSUFBSSxDQUFDQSxRQUFRLENBQUNNLGNBQWMsQ0FBQyxJQUFJLENBQUNKLFNBQVMsRUFBRVMsS0FBSyxDQUFDO0lBQ3JELENBQUMsTUFBTTtNQUNMLElBQUksQ0FBQ1YsS0FBSyxDQUFDYyxJQUFJLENBQUNKLEtBQUssQ0FBQztJQUN4QjtFQUNGO0FBQ0Y7QUFBQztBQUFBIn0=