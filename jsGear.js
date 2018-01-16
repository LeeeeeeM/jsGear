// 改变定时器的核心是改变系统时钟，通过改变时钟频率，自由定制时间队列，到达某个时刻执行函数，将异步执行转换为同步执行

window.Gear = (function(global, rate) {
	// 设置rate  [0-5]

	function setRate(n) {
		n = n - 2 // n [0, 5]整数
		return Math.pow(10, n);
	}

	var beginTime = new __Date()
	var LastTime = new __Date()

	var rate = 1

	function hook() {
		global.__setTimeout = global.setTimeout
		global.__setInterval = global.setInterval
		global.__clearTimeout = global.clearTimeout
		global.__clearInterval = global.clearInterval

		global.__set_rate__ = 1

		global.setTimeout = setTimeout
		global.setInterval = setInterval
		global.clearTimeout = clearTimeout
		global.clearInterval = clearInterval
	}

	function unhook() {

	}

	function setTimeout(fn, delay, arg) {
		if (arg) {
			arg = Array.prototype.slice.call(arguments, 2)
		}
		return addQue(fn, delay, arg, false)
	}

	function setInterval(fn, delay, arg) {
		if (arg) {
			arg = Array.prototype.slice.call(arguments, 2)
		}
		return addQue(fn, delay, arg, true)
	}

	function unhook() {
		//
	}


	var tQueue = []

	// function IndexedQueue = function() {
	// 	this.Queue = []
	// 	this.indexQueue = {

	// 	}
	// }
	// IndexedQueue.prototype = {
	// 	map: function(fn) {

	// 	},
	// 	push: function(item) {
	// 		if (!item.name)
	// 	},
	// 	getByIndex: function(index) {

	// 	},
	// 	getByName: function(name) {

	// 	},
	// 	removeByIndex: function(index) {

	// 	},
	// 	removeByName: function(name) {

	// 	}
	// }


	function Rate() {
		this.timerId = 0
		this.fnQueue = []
		this.rate = 1

		this.current = __Date.now()
		this.lastTime = __Date.now()
	}

	Rate.prototype = {
		addQueue: function(fn, delay, args, repeat) {
			if (!fn) {
				return
			}
			delay = (+delay < 1) ? 1 || +delay
			this.fnQueue[this.timerId] = {
				fn: fn,
				delay: delay,
				args: args,
				repeat: true,
				sum: 0
			}
			return this.timerId++
		},
		delQueue: function(id) {
			if (id < 0) {
				return
			}
			delete this.fnQueue[id]
		},
		timer: function() {
			var cur = __Date.now()
			var tickSpan = (cur - this.lastTime) * this.rate

			for (var k in this.fnQueue) {
				var task = this.fnQueue[k]
				task.sum += tickSpan
				if (task.repeat) {
					var skip = (task.sum / task.delay) >> 0

					if (skip > 20) {
						skip = 20
					}

					while (--skip >= 0) {
						excute(task)
					}

					// 剩余未执行的sum
					task.sum %= task.delay
				} else {
					if (task.sum >= task.delay) {
						excute(task)
						delete this.fnQueue[k]
						continue
					}
				}
			}
			this.lastTime = cur
			this.current += tickSpan
		},
		excute: function(task) {
			var code = task.code
			if (typeof code === 'function') {
				code.apply(null, task.args || {})
			}
		},
		init: function() {

		}
	}


	// function slice([], args) {
	// 	Array.prototype.slice.call([], args)
	// }

	var slice = Function.call.bind(Array.prototype.slice)

})(this)