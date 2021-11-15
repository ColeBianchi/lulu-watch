const https = require('https')
const fs = require('fs')
const lulu = require('./lulu.js')

const key = fs.readFileSync('certs/key.pem')
const cert = fs.readFileSync('certs/cert.pem')

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
				}
	
				res.end()
			})
		}
		else
		{
			res.writeHead(404)
			res.write("Uh oh...")
			res.end()
		}
	}
).listen(8080)

