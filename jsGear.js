// 改变定时器的核心是改变系统时钟，通过改变时钟频率，自由定制时间队列，到达某个时刻执行函数，将异步执行转换为同步执行
(function(global) {
	// 设置rate  [0-5]

	var __Date = global.Date

	function TimeLine(rate) {
		this.timerId = 0
		this.fnQueue = []
		this.time = 0
		this.rate = rate || 1
		this.pid = null

		this.current = __Date.now()
		this.lastTime = __Date.now()
		this.init()
	}

	TimeLine.prototype = {
		addQueue: function(fn, delay, args, repeat) {
			if (!fn) {
				return
			}
			delay = (+delay < 1) ? 1 : +delay
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
			console.log(this.time)
			delete this.fnQueue[id]
		},
		tickCycle: function() {
			var cur = __Date.now()
			var tickSpan = (cur - this.lastTime) * this.rate

			for (var k in this.fnQueue) {
				var task = this.fnQueue[k]
				task.sum += tickSpan
				if (task.repeat) {
					var skip = (task.sum / task.delay) >> 0

					// 最小粒度为1ms / 20，不要太过分
					// if (skip > 30) {
					// 	console.log('>>>')
					// 	skip = 20
					// }

					while (--skip >= 0) {
						this.excute(task)
					}

					// 剩余未执行的sum
					task.sum %= task.delay
				} else {
					if (task.sum >= task.delay) {
						this.excute(task)
						delete this.fnQueue[k]
						continue
					}
				}
			}
			this.lastTime = cur
			this.current += tickSpan
		},
		excute: function(task) {
			this.time++
			var code = task.fn
			if (typeof code === 'function') {
				code.apply(null, task.args || {})
			}
		},
		init: function() {
			var self = this
			this.pid = global.setInterval(self.tickCycle.bind(self), 1)
		},
		dispose: function() {
			global.clearInterval(this.pid)
			for (var k in this.fnQueue) {
				this.fnQueue[k] = null
			}
			this.fnQueue = null
		}
	}

	var slice = Function.call.bind(Array.prototype.slice)

	var watch = function(target, prop, callback) {
		Object.defineProperty(target, prop, {
			get: function() {
				return this['__' + prop]
			},
			set: function(val) {
				if (val !== this['__' + prop]) {
					this['__' + prop] = val
					callback()
				}
			}
		})
	}

	function TimeSpace(rate) {
		this.rate = 1
		this.timeline = new TimeLine()
		this.init(rate)
	}

	TimeSpace.prototype = {
		init: function(rate) {
			this.setRate(rate)
			this.timeline.rate = this.rate
			this.watch()
		},
		setTimeout: function(fn, delay, args) {
			args = args&&slice(args, 2)
			return this.timeline.addQueue(fn, delay, args, false)
		},
		setInterval: function(fn, delay, args) {
			args = args&&slice(args, 2)
			return this.timeline.addQueue(fn, delay, args, true)
		},
		requestAnimationFrame: function(fn, args) {
			this.setTimeout(fn, 16, args)
		},
		clearInterval: function(id) {
			this.timeline.delQueue(id)
		},
		clearTimeout: function(id) {
			this.timeline.delQueue(id)
		},
		watch: function() {
			watch(this, 'rate', function() {
				this.timeline.rate = this.rate
			}.bind(this))
		},
		destroy: function() {

		},
		setRate: function (n) {
			n = (n || 0) - 2 // n [0, 5]整数
			this.rate = Math.pow(10, n)
		}
	}


	global.TimeSpace = TimeSpace	

})(this)