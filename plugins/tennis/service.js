(function () {
	'use strict';

	function TennisService($http, $q, $interval, $window) {
		var settings = config.tennis || {};
		var key = typeof settings.key === 'string' ? settings.key.trim() : '';
		// 1,440 / 15 = 96 attempts/day, below the free key's 100/day limit.
		// Reserve each attempt before sending, including errors and mirror reloads.
		var minutes = Math.max(15, Math.min(1440, Number(settings.refreshInterval) || 15));
		var cooldownKey = 'smart-mirror.tennis.next-request';
		var cacheKey = 'smart-mirror.tennis.snapshot';
		var pending = null;
		var timer = null;
		var readers = 0;
		var state = {
			enabled: key.length > 0,
			matches: [],
			updatedAt: null,
			nextRequestAt: 0,
			more: false,
			loading: false,
			error: null
		};

		function reserve(until) {
			state.nextRequestAt = until;
			$window.localStorage.setItem(cooldownKey, String(until));
		}

		function readCooldown() {
			var until = Number($window.localStorage.getItem(cooldownKey));
			if (!Number.isFinite(until) || until < 0) {
				throw new Error('Invalid tennis refresh time');
			}
			return until;
		}

		function displayMatch(match) {
			if (!match || !match.players || !match.players.p1 || !match.players.p2 ||
				typeof match.players.p1.name !== 'string' || typeof match.players.p2.name !== 'string') {
				throw new Error('Invalid tennis match');
			}
			var score = match.score;
			var available = !!(score && Array.isArray(score.games) && score.games.length === 2 &&
				Array.isArray(score.games[0]) && Array.isArray(score.games[1]));
			var columns = available ? Math.max(score.games[0].length, score.games[1].length) : 0;
			var players = [match.players.p1, match.players.p2].map(function (player, index) {
				var games = [];
				for (var set = 0; set < columns; set++) {
					var value = score.games[index][set];
					games.push(Number.isInteger(value) && value >= 0 ? value : '—');
				}
				var points = available && Array.isArray(score.points) ? score.points[index] : null;
				return {
					name: player.name,
					games: games,
					points: points == null ? '—' : String(points),
					serving: available && score.server === index + 1
				};
			});
			return {
				tournament: match.tournament,
				status: match.event_status,
				available: available,
				tiebreak: available && score.is_tiebreak === true,
				players: players
			};
		}

		function refresh() {
			if (!state.enabled) return $q.when(state);
			if (pending) return pending;
			var now = Date.now();
			try {
				state.nextRequestAt = Math.max(state.nextRequestAt, readCooldown());
				if (now < state.nextRequestAt) return $q.when(state);
				reserve(now + minutes * 60000);
			} catch (error) {
				// Without persistent spacing, reloading could spend the daily quota.
				state.error = 'tennis.storageError';
				return $q.when(state);
			}
			state.loading = true;
			state.error = null;
			pending = $http.get('https://api.livetennisapi.com/api/public/v1/matches', {
				params: { status: 'live', limit: 200 },
				headers: { 'X-API-Key': key },
				timeout: 10000
			}).then(function (response) {
				if (!response.data || !Array.isArray(response.data.data)) {
					throw new Error('Invalid tennis response');
				}
				// One page only: pagination would multiply the daily request budget.
				var matches = response.data.data.map(displayMatch);
				state.matches = matches;
				state.more = !!(response.data.meta && response.data.meta.has_more);
				state.updatedAt = Date.now();
				try {
					$window.localStorage.setItem(cacheKey, JSON.stringify({
						matches: matches, more: state.more, updatedAt: state.updatedAt
					}));
				} catch (error) {
					// Caching the display is optional; the cooldown is already saved.
				}
			}).catch(function (error) {
				state.error = error.status === 401 || error.status === 403 ?
					'tennis.keyError' : 'tennis.fetchError';
				if (error.status === 429) {
					var retry = error.headers('Retry-After');
					var delay = retry && /^\d+$/.test(retry) ? Number(retry) * 1000 : Date.parse(retry) - Date.now();
					if (!Number.isFinite(delay) || delay < 0) delay = 86400000;
					try {
						reserve(Math.max(state.nextRequestAt, Date.now() + delay));
					} catch (storageError) {
						state.error = 'tennis.storageError';
					}
				}
			}).finally(function () {
				state.loading = false;
				pending = null;
			});
			return pending;
		}

		if (state.enabled) {
			try {
				var cached = JSON.parse($window.localStorage.getItem(cacheKey));
				if (cached && Array.isArray(cached.matches) && Number.isFinite(cached.updatedAt)) {
					state.matches = cached.matches;
					state.updatedAt = cached.updatedAt;
					state.more = cached.more === true;
				}
			} catch (error) {
				// A missing/invalid snapshot must not reset the separate cooldown.
			}
		}

		return {
			state: state,
			refresh: refresh,
			start: function () {
				if (!state.enabled) return angular.noop;
				readers++;
				if (!timer) {
					refresh();
					timer = $interval(refresh, 60000);
				}
				var stopped = false;
				return function () {
					if (stopped) return;
					stopped = true;
					if (--readers === 0) {
						$interval.cancel(timer);
						timer = null;
					}
				};
			}
		};
	}

	angular.module('SmartMirror').factory('TennisService', TennisService);
}());
