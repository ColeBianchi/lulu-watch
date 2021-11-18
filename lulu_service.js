const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
var lulu = require("./lulu.js")

var nextPage = workerData.last_page

parentPort.on("message", message =>
{
	if (message == "exit")
	{
		console.error("ADD CODE TO KILL THREAD")
	}
})


lulu.getLastPage(workerData.settings.category, (res, err) =>
{
	if (err)
	{
		console.error("LULUSER | Error getting last page: "+res)
	}
	else
	{
		setInterval(() =>
		{
			requestLoop(res)
		}, workerData.settings.request_timeout)
	}
})

function requestLoop(lastPage)
{
	if (workerData.settings.enabled)
	{
		lulu.requestPageJSON(nextPage, workerData.settings.category, (res, err) =>
		{
			if (err)
			{
				console.error("LULUSER | Error requesting page "+nextPage+" | "+res)
			}
			else
			{
				parentPort.postMessage({ message_type: "page_number", data: nextPage })

				nextPage += 1
				
				if (nextPage > lastPage)
				{
					nextPage = 1
				}
				
				parentPort.postMessage({ message_type: "page_data", data: res })
			}
		})
	}
}