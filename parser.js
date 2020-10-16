const telegram = require('telegraf/telegram');
const fs = require('fs');
const Parser = require('rss-parser');
const parser = new Parser({
	defaultRSS: 2.0,
	timeout: 5000
});
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramChat = process.env.TELEGRAM_CHAT_ID;
const telegramClient = new telegram(telegramToken);
const feedURL = process.env.RSS_URL;
let parseOption = process.env.OPTION;
let comparator = process.env.COMPARATOR;
let yield = process.env.YIELD;

// Validate that all required fields are available.
try {
	if (fs.existsSync("/usr/src/parser/Bases.txt")) {
		console.log("Bases.txt found")
	};
} catch (err) {
	console.error(err);
	console.log("please mound in a text file under the following directory in the docker container. /usr/src/parser/Bases.txt");
	process.exit();
};

if (typeof telegramToken === 'undefined') {
	console.log("To use Telegram integration, please make sure you have TELEGRAM_BOT_TOKEN set as an environment variable.");
	process.exit();
}

if (typeof telegramChat === 'undefined') {
	console.log("To use Telegram integration, please make sure you have TELEGRAM_CHAT_ID set as an environment variable.");
	process.exit();
};

if (typeof feedURL === 'undefined') {
	console.log("Please provide the RSS feed you wish to parse, please make sure you have RSS_URL set as an environment variable.");
	process.exit();
};

if (typeof comparator === 'undefined') {
	console.log("Please provide the value you're comparing against the base.txt file, please make sure you have COMPARATOR set as an environment variable.");
	process.exit();
};

if (typeof yield === 'undefined') {
	console.log("Please provide the value you wish to return from the RSS feed, please make sure you have YIELD set as an environment variable.");
	process.exit();
};

// Set all comparators to lower case for better comparison results
if (typeof parseOption === 'undefined') {
	console.log("No secondary parse requirement provided, please make sure you have OPTION set as an environment variable for another condition.");
} else {
	try {
		parseOption = parseOption.toLowerCase();
	} catch (e) {
		console.error(e)
	}
}

comparator = comparator.toLowerCase();
yield = yield.toLowerCase();

var rerun = async function parsing() {
	(async () => {
		// Declare feed as parsed RSS and files used for comparing. We use a try catch, as the parser won't always return an expected response.
		let feed;
		try {
			feed = await parser.parseURL(`${feedURL}`);
		}
		catch (e){
			console.log(e);
			return setTimeout(rerun, 10000);
		}
		let baseParse = fs.readFileSync('/usr/src/parser/Bases.txt').toString().toLowerCase().split("\n");
		let cache = fs.readFileSync('/usr/src/parser/cache.txt').toString().toLowerCase().split("\n");
		baseParse = baseParse.filter(function (item) {
			return item.length > 1;
		})

		// Loop through all items in base parse and see if they match any content in the RSS feed
		await feed.items.forEach(() => {
			baseParse.forEach(compare);
		});

		function compare(array) {
			feed.items.forEach(item => {
				exist = 0;
				if (typeof parseOption === 'undefined') {
					if (item[comparator].toLowerCase().includes(array) && !cache.includes(item[yield])) {
						// Loop through all items in cache and see if they match any content in the RSS feed. If found, ignore the file and move on.
						console.log(item[comparator].toLowerCase(), "Matches: ", array)
						telegramClient.sendMessage(telegramChat, `<b>${item[comparator]}</b> \n${item[yield]}`, { parse_mode: 'HTML' });
						cache.push(item[yield].toLowerCase());
					}
				} else {
					if (item[comparator].toLowerCase().includes(array) && item[comparator].toLowerCase().includes(parseOption) && !cache.includes(item[yield])) {
						// Loop through all items in cache and see if they match any content in the RSS feed including the parse Option. If found, ignore the file and move on.
						console.log(item[comparator].toLowerCase(), "Matches: ", array, " with ", parseOption)
						telegramClient.sendMessage(telegramChat, `<b>${item[comparator]}</b> \n${item[yield]}`, { parse_mode: 'HTML' });
						cache.push(item[yield].toLowerCase());
					}
				}
			})
		}

		// Remove items from cache if they are no longer found in the RSS feed.
		function cleanup(array) {
			feed.items.forEach(item => {
				if (item[yield].toLowerCase() == array) {
					cacheUpdated.push(item[yield].toLowerCase())
				}
			})
		}

		let cacheUpdated = [];
		cache.forEach(cleanup);
		let cacheFile = cacheUpdated.join('\n');
		try {
			fs.truncate('/usr/src/parser/cache.txt', 0, function (err) {
				if (err) console.log('error', err);
			});
		} catch {
			console.log("could not truncate file")
		}
		try {
			fs.writeFile('/usr/src/parser/cache.txt', cacheFile, function (err) {
				if (err) console.log('error', err);
			});
		} catch {
			console.log("could not write file")
		}
		setTimeout(rerun, 10000)
	})()
};
rerun();