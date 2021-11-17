const { Console } = require('console')
const https = require('https')
const { Worker } = require('worker_threads')

var last_page = 1

var getlastPage = exports.getLastPage = function (category, callback)
{
	requestPageJSON(1, category, (data, error) =>
	{
		var split = ""

		try
		{
			callback(data['links']['last'].split('=')[1], error)
		}
		catch (TypeError)
		{
			callback("Invalid JSON Response", true)
		}
	})
}

var requestPageJSON = exports.requestPageJSON = function (num, category, callback)
{
	const req = https.request(
		{
			hostname: 'shop.lululemon.com',
			port: 443,
			path: '/api/c/'+category+'?page='+num+'&pagesize=45',
			method: 'GET'
		}, 
		res => 
		{
			console.info("LULUREQ | " + num + ", " + category + " | " + res.statusCode)
			res.setEncoding('utf8')

			var data = ''
			res.on('data', chunk =>
			{
				data += chunk
			})

			res.on('end', () =>
			{
				callback(JSON.parse(data), false)
			})
		}
	)

	req.on('error', err =>
	{
		console.error("REQUEST | " + num + ", " + category + " | " + err.message)
		callback(err.message, true)
	})

	req.end()
}