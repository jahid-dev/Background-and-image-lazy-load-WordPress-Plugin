
(function ($, window, document) {
    var pluginName = 'jhLoadImage',
        defaults = {
            offset: '75%',
            delay: 750,
            pluginId: 'jhLoadImage'
        };

    function JHLoadImage(elements, options) {
        this.elements = elements;
        this.offset = 0;
        this.windowHeight = 0;
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }
    JHLoadImage.prototype.getOffset = function () {
        var offset;
        if (typeof this.options.offset === 'string') {
            offset = parseFloat(this.options.offset) * this.windowHeight / 100;
        } else {
            offset = this.options.offset;
        }
        this.offset = -offset;
        return -offset;
    };
    JHLoadImage.prototype.updateWindowHeight = function () {
        this.windowHeight = document.documentElement.clientHeight;
        return this.windowHeight;
    };
    JHLoadImage.prototype.throttle = function (func, ms) {
        // https://learn.javascript.ru/task/throttle
        var isThrottle = false,
            savedArgs,
            savedThis;

        function wrapper() {
            if (isThrottle) {
                savedArgs = arguments;
                savedThis = this;
                return;
            }
            func.apply(this, arguments);
            isThrottle = true;
            setTimeout(function () {
                isThrottle = false;
                if (savedArgs) {
                    wrapper.apply(savedThis, savedArgs);
                    savedArgs = savedThis = null;
                }
            }, ms);
        }
        return wrapper;
    };
    JHLoadImage.prototype.init = function () {
        var _this = this;
        var throttle = this.throttle(this.showVisible, this.options.delay);
        function handler(event) {
            _this.getOffset();
            if (event.type === 'resize') {
                _this.updateWindowHeight();
            }
            throttle.call(_this);
        }
        $(document).on('scroll.' + this.options.pluginId, handler);
        $(window).on('resize.' + this.options.pluginId, handler);

        this.getOffset();
        this.updateWindowHeight();
        this.showVisible();
    };
    JHLoadImage.prototype.checkVisible = function (elem) {
        var coordinates = elem.getBoundingClientRect();
        var visibleTop = coordinates.top > 0 && coordinates.top + this.offset <= this.windowHeight;
        var visibleBottom = coordinates.bottom > this.offset && coordinates.bottom <= this.windowHeight;
        var visibleCenter = coordinates.top < 0 && coordinates.bottom > this.windowHeight;

        return visibleTop || visibleBottom || visibleCenter;
    };
    JHLoadImage.prototype.showVisible = function () {
        var items = this.elements;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var realSrc = item.getAttribute('data-jh-lazy-img');
            if (!realSrc) {
                continue;
            }
            if (this.checkVisible(item)) {
                if (item.tagName === 'IMG') {
                    item.src = realSrc;
                } else {
                    item.style.backgroundImage = 'url(' + realSrc + ')';
                }
                item.setAttribute('data-jh-lazy-img', '');
            }
        }
    };
    JHLoadImage.prototype.reInit = function () {
        this.destroy();
        this.init();
    };
    JHLoadImage.prototype.destroy = function () {
        $(document).off('scroll.' + this.options.pluginId);
        $(window).off('resize.' + this.options.pluginId);
    };

    $.fn[pluginName] = function (options) {
        if (!$.data(this, 'plugin_' + pluginName)) {
            $.data(this, 'plugin_' + pluginName);
            return new JHLoadImage(this, options).elements;
        }
    };
})(jQuery, window, document);
