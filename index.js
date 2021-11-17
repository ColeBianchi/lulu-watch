const https = require('https')
const fs = require('fs')
const url = require('url')
const lulu = require('./lulu.js')

const key = fs.readFileSync('certs/key.pem')
const cert = fs.readFileSync('certs/cert.pem')

var settings = JSON.parse(fs.readFileSync('settings.json'))

const worker = new Worker('./lulu_service.js', {  })
worker.on('message', (data) =>
{
	console.info("LULUSER | Data received from worker")
	
	if (data.message_type == "last_page")
	{
		last_page = data.data
	}
	else if (data.message_type == "page_data")
	{
		
	}
})
worker.on('error', (err) =>
{
	console.error("LULUSER | ERROR:" + err)
})
worker.on('exit', (code) =>
{
	if (code != 0)
	{
		console.error("LULUSER | Worker stopped with exit code "+code)
	}
})

https.createServer(
	{
		key: key,
		cert: cert
	}, 
	(req, res) =>
	{
		console.info("REQUEST | " + req.url)

		if (req.url == "/favicon.ico")
		{
			res.writeHead(404)
			res.end()
		}
		else if (req.url == "/women" || req.url == "/men")
		{
			var category = "women"
			if (req.url == "/men") category = "men"

			lulu.getLastPage(category, (pageNumber, error) =>
			{
				if (error)
				{
					res.writeHead(500)
					res.end("ERROR: " + pageNumber)
				}
				else
				{
					res.writeHead(200)
					res.write(pageNumber)

					for (var i = 1; i <= pageNumber; i++)
					{
						
					}
				}
	
				res.end()
			})
		}
		else if (req.url == "/")
		{
			res.writeHead(200)
			res.write(fs.readFileSync('control.html'))
			res.end()
		}
		else if (req.url.includes("/settings"))
		{
			const queryObject = url.parse(req.url, true).query
			
			for (var key in queryObject)
			{
				settings[key] = JSON.parse(queryObject[key])
			}

			fs.writeFile('settings.json', JSON.stringify(settings), (err) =>
			{
				if (err)
				{
					res.writeHead(500)
					res.write("Error writing to settings file")
					res.end()
				}
				else
				{
					res.writeHead(200)
					res.write(JSON.stringify(settings))
					res.end()
				}
			})
		}
		else if (req.url == "/materialize/fonts/material.woff2") //Special case cause not utf8
		{
			res.writeHead(200)
			res.write(fs.readFileSync('materialize/fonts/material.woff2'))
			res.end()
		}
		else
		{
			fs.readFile('.' + req.url, 
			{
				encoding: 'utf8',
				flag: 'r'
			},
			(err, data) =>
			{
				if (err)
				{
					res.writeHead(404)
					res.write("Uh oh...")
					res.end()
				}
				else
				{
					res.writeHead(200)
					res.write(data)
					res.end()
				}
			})
		}
	}
).listen(8080)

