# telegram-rss-return
Return RSS values based on given criteria specified in a text file, and the docker environment variables

## What is this?

This is a hobby project to monitor updates on RSS feeds to send updates to Telegram messenger.

## How to Run

Multiple -e entries for various environments. environment variables listed further down.

```
docker run -d -e TELEGRAM_BOT_TOKEN=secret1 -e TELEGRAM_CHAT_ID=secret2 -e RSS_URL=https://RSS_URL_HERE -e COMPARATOR=ValueYouAreComparing -e YIELD=ValueYouAreReturningIfComparisonPasses -e OPTION=AdditionalValueToCompareAgainstCOMPARATOR -v Bases.txt:/usr/src/parser/Bases.txt sethrah/telegramrssreturn
```

### Docker Compose
For fast setup, download the docker-compose.yml file and use docker-compose to manage the container a bit easier.

```
curl -o https://raw.githubusercontent.com/seth-rah/FFXIV_Telegram_News/master/docker-compose.yml
```

Relpace environment variables as needed and run `docker-compose up -d` once completed.

## Environment Variables
### Telegram

[Set up a telegram bot](https://core.telegram.org/bots#3-how-do-i-create-a-bot) and get the `Bot Token`. Then add the bot to a group, make it admin and [extract the Chat ID](https://stackoverflow.com/a/32572159/882223).

```
Telegram Bot Token                            		=	TELEGRAM_BOT_TOKEN
Telegram Chat ID                              		=	TELEGRAM_CHAT_ID
```

### RSS

```
URL that you are monitoring for RSS updates		=	RSS_URL
Value you are comparing to Bases.txt          		=	COMPARATOR
Value you want to return if comparator passes    	=	YIELD
Additional value you want to pass with Bases.txt 	=	OPTION
```

## Volumes
### RSS
2 Files are made use of with this application. Bases.txt and cache.txt. You need to mount in Bases yourself in order to provide the application with the rules for the comparator. If text on a line passes the comparator check, then you will get a post created on Telegram.

The file you don't need to worry about is cache.txt. This file will keep track of the information that has already been posted to telegram, and will clean itself up with time automatically to avoid cluttering your system.

## Plans

None at this time.

## Contribution

Please let me know through an issue or pull request.

