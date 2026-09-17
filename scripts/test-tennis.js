'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '../plugins/tennis/service.js'), 'utf8');
const minute = 60000;
const origin = Date.UTC(2026, 0, 1);

function harness(options) {
	options = options || {};
	const clock = options.clock || { now: origin };
	const values = options.values || {};
	const requests = [];
	const timers = [];
	let factory;
	let blocked = false;
	const storage = {
		getItem: function (key) { return values[key] || null; },
		setItem: function (key, value) {
			if (blocked) throw new Error('Storage unavailable');
			values[key] = value;
		}
	};
	const interval = function (callback) {
		const timer = { callback: callback, active: true };
		timers.push(timer);
		return timer;
	};
	interval.cancel = function (timer) { timer.active = false; };
	vm.runInNewContext(source, {
		config: { tennis: options.settings || { key: 'test-key' } },
		Date: { now: function () { return clock.now; }, parse: Date.parse },
		angular: {
			noop: function () {},
			module: function () {
				return { factory: function (name, fn) { factory = fn; } };
			}
		}
	});
	const service = factory({
		get: function (url, config) {
			assert(Number(values['smart-mirror.tennis.next-request']) >= clock.now + 15 * minute,
				'The cooldown must be persisted before making the request');
			return new Promise(function (resolve, reject) {
				requests.push({ url: url, config: config, resolve: resolve, reject: reject });
			});
		}
	}, { when: Promise.resolve.bind(Promise) }, interval, { localStorage: storage });
	return {
		service: service, clock: clock, values: values, requests: requests, timers: timers,
		blockStorage: function () { blocked = true; }
	};
}

function match(score) {
	return {
		id: 123, tournament: 'Example tournament', status: 'live', event_status: null,
		players: { p1: { name: 'Player A' }, p2: { name: 'Player B' } },
		score: score
	};
}

function success(request, matches, more) {
	request.resolve({ data: { data: matches || [], meta: { has_more: !!more } } });
}

async function run() {
	let passed = 0;
	async function test(name, fn) {
		await fn();
		passed++;
		console.log('PASS ' + name);
	}

	await test('missing or blank keys make no requests and start no timers', async function () {
		for (const settings of [{}, { key: '' }, { key: '  ' }]) {
			const h = harness({ settings: settings });
			h.service.start()();
			await h.service.refresh();
			assert.strictEqual(h.requests.length, 0);
			assert.strictEqual(h.timers.length, 0);
			assert.strictEqual(h.service.state.enabled, false);
		}
	});

	await test('shared in-flight request uses only the free live endpoint and header authentication', async function () {
		const h = harness();
		const first = h.service.refresh();
		assert.strictEqual(h.service.refresh(), first);
		assert.strictEqual(h.requests.length, 1);
		const request = h.requests[0];
		assert.strictEqual(request.url, 'https://api.livetennisapi.com/api/public/v1/matches');
		assert.strictEqual(JSON.stringify(request.config.params), '{"status":"live","limit":200}');
		assert.strictEqual(request.config.headers['X-API-Key'], 'test-key');
		assert.strictEqual(request.config.timeout, 10000);
		success(request, [], true);
		await first;
		assert.strictEqual(h.service.state.more, true);
		assert.strictEqual(h.requests.length, 1, 'More results must not cause pagination');
		assert(!JSON.stringify(h.values).includes('test-key'), 'Never persist credentials in the cache');
	});

	await test('player-major set scores, tiebreak points and server remain on the correct row', async function () {
		const h = harness();
		const result = h.service.refresh();
		success(h.requests[0], [match({ games: [[6, 3], [4, 4]], points: ['7', '6'], server: 2, is_tiebreak: true })]);
		await result;
		const value = h.service.state.matches[0];
		assert.strictEqual(JSON.stringify(value.players.map(function (p) { return p.games; })), '[[6,3],[4,4]]');
		assert.strictEqual(value.players[0].points, '7');
		assert.strictEqual(value.players[1].points, '6');
		assert.strictEqual(value.players[0].serving, false);
		assert.strictEqual(value.players[1].serving, true);
		assert.strictEqual(value.tiebreak, true);
	});

	await test('null scores, withheld games and null points never become invented zero scores', async function () {
		const h = harness();
		const result = h.service.refresh();
		success(h.requests[0], [match(null), match({ games: null, points: ['0', '0'], server: 1 }),
			match({ games: [[6], [4, 0]], points: [null, null], server: null }), match({ games: [], points: [] })]);
		await result;
		const matches = h.service.state.matches;
		assert.strictEqual(matches[0].available, false);
		assert.strictEqual(matches[1].available, false);
		assert.strictEqual(matches[1].players[0].serving, false);
		assert.strictEqual(matches[2].players[0].points, '—');
		assert.strictEqual(matches[2].players[0].games[1], '—');
		assert.strictEqual(matches[2].players[1].games[1], 0);
		assert.strictEqual(matches[3].available, false);
	});

	await test('hand-edited intervals are clamped and failures cannot exceed 96 attempts per day', async function () {
		for (const interval of [0, -1, 1, 'not-a-number']) {
			const h = harness({ settings: { key: 'test-key', refreshInterval: interval } });
			for (let elapsed = 0; elapsed < 24 * 60; elapsed++) {
				h.clock.now = origin + elapsed * minute;
				const previous = h.requests.length;
				const result = h.service.refresh();
				if (h.requests.length > previous) h.requests[previous].reject({ status: 500 });
				await result;
			}
			assert.strictEqual(h.requests.length, 96);
			assert.strictEqual(h.service.state.error, 'tennis.fetchError');
		}
	});

	await test('longer configured intervals remain in effect', async function () {
		const h = harness({ settings: { key: 'test-key', refreshInterval: 30 } });
		const result = h.service.refresh();
		success(h.requests[0]);
		await result;
		h.clock.now += 15 * minute;
		await h.service.refresh();
		assert.strictEqual(h.requests.length, 1);
		assert.strictEqual(h.service.state.nextRequestAt, origin + 30 * minute);
	});

	await test('reload preserves the cached snapshot and the reserved cooldown', async function () {
		const first = harness();
		const result = first.service.refresh();
		success(first.requests[0], [match(null)]);
		await result;
		first.clock.now += minute;
		const second = harness({ values: first.values, clock: first.clock });
		assert.strictEqual(second.service.state.updatedAt, origin);
		assert.strictEqual(second.service.state.matches.length, 1);
		await second.service.refresh();
		assert.strictEqual(second.requests.length, 0);
		second.clock.now = origin + 15 * minute;
		const next = second.service.refresh();
		assert.strictEqual(second.requests.length, 1);
		success(second.requests[0]);
		await next;
		assert.strictEqual(second.service.state.matches.length, 0);
	});

	await test('malformed and failed responses retain the dated snapshot instead of showing an empty success', async function () {
		const h = harness();
		let result = h.service.refresh();
		success(h.requests[0], [match(null)]);
		await result;
		for (const failure of [{ data: {} }, { data: { data: [null] } }, { status: 401 }, { status: -1 }]) {
			h.clock.now += 15 * minute;
			result = h.service.refresh();
			const request = h.requests[h.requests.length - 1];
			if (failure.data) request.resolve(failure);
			else request.reject(failure);
			await result;
			assert.strictEqual(h.service.state.matches.length, 1);
			assert.strictEqual(h.service.state.updatedAt, origin);
			assert.strictEqual(h.service.state.loading, false);
			assert(h.service.state.error);
			const count = h.requests.length;
			await h.service.refresh();
			assert.strictEqual(h.requests.length, count);
		}
	});

	await test('429 delays accept seconds and HTTP dates, persist across reloads, and default to a day', async function () {
		for (const retry of ['3600', new Date(origin + 60 * minute).toUTCString(), null, 'bad-value']) {
			const h = harness();
			const result = h.service.refresh();
			h.requests[0].reject({ status: 429, headers: function () { return retry; } });
			await result;
			const delay = retry && retry !== 'bad-value' ? 60 * minute : 24 * 60 * minute;
			assert.strictEqual(h.service.state.nextRequestAt, origin + delay);
			h.clock.now += 15 * minute;
			const reloaded = harness({ values: h.values, clock: h.clock });
			await reloaded.service.refresh();
			assert.strictEqual(reloaded.requests.length, 0);
		}
	});

	await test('unwritable or corrupt cooldown storage prevents requests', async function () {
		const blocked = harness();
		blocked.blockStorage();
		await blocked.service.refresh();
		assert.strictEqual(blocked.requests.length, 0);
		assert.strictEqual(blocked.service.state.error, 'tennis.storageError');
		const corrupt = harness({ values: { 'smart-mirror.tennis.next-request': 'invalid' } });
		await corrupt.service.refresh();
		assert.strictEqual(corrupt.requests.length, 0);
		assert.strictEqual(corrupt.service.state.error, 'tennis.storageError');
	});

	await test('views share one timer and the last destroyed view cancels it', async function () {
		const h = harness();
		const stopFirst = h.service.start();
		const stopSecond = h.service.start();
		assert.strictEqual(h.timers.length, 1);
		assert.strictEqual(h.requests.length, 1);
		success(h.requests[0]);
		await h.service.refresh();
		stopFirst();
		stopFirst();
		assert.strictEqual(h.timers[0].active, true);
		stopSecond();
		assert.strictEqual(h.timers[0].active, false);
	});

	console.log(passed + ' tennis regression groups passed');
}

run().catch(function (error) {
	console.error(error);
	process.exitCode = 1;
});
