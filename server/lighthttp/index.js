var fs = require("fs")
var querystring = require('querystring')
var path = require("path")
var http = require("http")
var https = require("https")

var support = {
	includes: true
}
try {
	[].includes()
} catch (a) {
	support.includes = false
	var msg = "you should update your node js to increase preference"
	try {
		log(msg)
	} catch (a) {
		console.log(msg)
	}
}
var newf = function() {
	var lightHTTP = {}
	lightHTTP.web_directory = "./htdocs"//location to serve files from (must not end in a slash)
	lightHTTP.default_fs = true //serve a website from the file system
	lightHTTP.enable_ssjs = false //enable the execution of server side javascript files
	lightHTTP.index_files = ["index.ssjs", "index.html", "index.htm", "index.txt", "index.png"] //which files to serve when a directory is requested
	lightHTTP.auto_index_settings = {
		enabled:false, //display contents of directories without index files
		max_folders_for_sorting: 100, //only sort folders if there are less folders than this in a directory
		max_files_for_sorting: 500, //only sort files if there are less files than this in a directory
		autoindex_icon_location: "/server_include/autoindex/icons/", //folder where icons are located
	}
	
	lightHTTP.disabled_extentions = ["webhide","htaccess","htpasswd"] //hide files with these extension
	lightHTTP.server_include_url = "/server_include/" //url that the following must end in a slash
	lightHTTP.server_include_file_path = path.join(__dirname,"./default_include_dir/") //must end in a slash
	lightHTTP.disable_keepalive = false
	lightHTTP.cache_settings = { // user side cache
		enabled: true,
		long_cache_cutoff: 60 * 60 * 24 * 10, //if a file is older than this many seconds use long_cache_time
		short_cache_time: 1, //seconds
		long_cache_time: 60 * 60, //seconds
		auto_redirect_cache_time:10, //seconds to cache auto redirects (example: /example -> /example/)
		auto_index_cache_time:10, //seconds to cache auto index pages
		cacheability: "public", //public (cachable by proxies) or   private (only cachable by users browser)
	}
	lightHTTP.error_files = { //files for error pages (do not start with slashes)
		403: "error/403.html",
		404: "error/404.html",
		use_include_file_path: true, //use the above paths inside the include directory
	}
	lightHTTP.error_files_defaults = { //this will be used if error files can not be found
		404: "<!DOCTYPE html><html><body style='text-align:center;font-size:100px;background-color:rgb(170, 69, 69);'>404 file not found</body><html>",
	}
	lightHTTP.console_log = {
		url: false,
		filerequests: false,
		req: false,
		res: false,
		error: true,
		all: false
	}
	
	lightHTTP.urlhandles = []
	lightHTTP.requests = 0
	lightHTTP.servers = []
	lightHTTP.start = function(httpserver, options) {
		var server = httpserver.createServer(options)
		servers.push(server)
		server.on("error", function(err) {
			if (err.code == "EADDRINUSE") {
				console.log("--------------------------------------------------")
				console.log("This port is already in use the server can't start")
				console.log("--------------------------------------------------")
			}
		})
		server.listen(this.port, (function() {
			console.log('Light HTTP server is running on port ' + this.port)
		}).bind(this))
		server.on("request", (function(req, res) {
			this.request_handler(req, res)
		}).bind(this))

	}
	lightHTTP.create_server = function(obj) {
		obj = obj || {}
		var sec = !!obj.https
		//var server = ((sec)?http:https).createServer(obj.options||{})
		var server = undefined
		if (sec) {
			server = https.createServer(obj.ssl)
		} else {
			server = http.createServer()
		}
		for (var x in obj.server) {
			server[x] = obj.server[x]
		}
		server.on("error", function(err) {
			if(!lightHTTP.console_log.error&&!lightHTTP.console_log.all){
				return
			}
			if (err.code == "EADDRINUSE") {
				console.log("--------------------------------------------------")
				console.log("This port is already in use the server can't start")
				console.log("--------------------------------------------------")
			}
			//else{
			console.log(err)
			//}
		})
		if(obj.port != undefined){
			server.listen(obj.port, (function() {
				//log('http' + ((sec) ? "s" : "") + ' server is running on port ' + this.port)
			}).bind(obj))
		}
		lightHTTP.add_server(server)
		return server
	}
	lightHTTP.add_server = function(server) {
		this.servers.push(server)
		server.on("request", (function(req, res) {
			this.request_handler(req, res)
		}).bind(this))
	}
	lightHTTP.request_handler = function(req, res) {
		//console.log(req,res)
		lightHTTP.requests += 1
		req.lightHTTP = this
		res.lightHTTP = this
		var urlo = req.url
		var url = req.url
		var urs = url.split("?")
		url = urs.splice(0, 1)[0]
		url = querystring.unescape(url)
		url = url.replace(/\\/g, "/")
		var paramsraw = urs.join("?")

		var params = {}
		if (paramsraw) {
			
			//var params={}
			//var spp=paramsraw.split("&")
			//for(var x in spp){
			//var x2=spp[x]
			//var s1=x2.split("=")
			//var x2=s1.splice(0,1)[0]
			//var val=s1.join("=")
			//params[unescape(x2)]=unescape(val)
			//}

			params = querystring.parse(paramsraw)
			//console.log(params)
			req.params = params

		}
		if (this.console_log.req || this.console_log.all) {
			console.log(req)
		}
		if (this.disable_keepalive) {
			res.setHeader("Connection", "close")
		}
		
		if (this.web_directory[this.web_directory.length - 1] != "/") {
			//this.web_directory+="/"
		}
		var web_directory = this.web_directory
		if (web_directory[web_directory.length - 1] == "/" && url[0] == "/") {
			web_directory = web_directory.substring(0, web_directory.length - 1)
		}

		var absolute_file = resolvepath(web_directory + url)
		var absolute_file_pathdata=""
		function absolutefiledatafunction(){
			absolute_file_pathdata=path.parse(absolute_file)
			absolute_file_pathdata.isDirectory=(absolute_file[absolute_file.length-1]==path.sep)
		}
		absolutefiledatafunction()
		//console.log(absolute_file)
		//console.log(absolute_file_pathdata)
		
		var absolute_file_stats = undefined
		var webdirpath = this.web_directory_absolute = resolvepath(this.web_directory)

		req.urlx = url
		req.allow_cache = true
		//console.log(req)
		var nowtime = req.time = Date.now()
		req.paramsraw = paramsraw
		if (this.console_log.url || this.console_log.all) {
			console.log(url)
		}
		
		
		//console.log(fileext)

		var jsext = {
			req: req,
			res: res,
			url: url,
			params_raw: paramsraw,
			params: params,
			absolute_file: absolute_file,
			new_absolute_file:false,
			server: lightHTTP,
			streamfile: function(filepath, opts) {
				fs.createReadStream(filepath, opts || {}).pipe(res)
			}
		}
		//jsext.decodepostbody=function(){
		//var req=this.req
		//}
		var thi = this
		var getfromfs = function() {
			if (thi.default_fs) {
				var fil = getfromfs.files
				var thisa = {
					fil: fil,
					thi: thi
				}
				var filrecur = (function() {

					var fileobj = this.fil.splice(0, 1)[0]
					if (fileobj) {
						
						var filePath = fileobj.file
						if(filePath){
							var pathdata=path.parse(filePath)
						}else{
							var pathdata={base:"",ext:""}
						}
						var filename = pathdata.base
						//if (filePath) {
						//	filename = filePath.split("/").reverse().splice(0, 1)[0] || ""
						//}
						//console.log(filename+"---")
						this.filename = filename
						//console.log(filename)
						//console.log(pathdata)
						if (this.thi.console_log.filerequests || this.thi.console_log.all) {
							console.log(fileobj)
						}
						statcallback = (statcallback).bind(this)
						if (filePath !== false) {
							fs.stat(filePath, statcallback)
						} else {
							if (fileobj.data) {
								statcallback(undefined, {
									isFile: function() {
										return false
									},
									isDirectory: function() {
										return false
									}
								})
							}
						}
						//console.log("hi")
						//console.log(fileobj)
						function statcallback(err, stats) {

							//console.log(stats)
							if (err) {
								this.fun()
								return
							}
							//console.log(this.thi.allow_file(this.filename))
							var isFile = stats.isFile()
							var ext = pathdata.ext.substr(1)
							if ((isFile && this.thi.allow_file(undefined,ext)) || fileobj.data) {
								
								//console.log(pathdata)
								//var fileext=
								//if (isFile) {
								//	ext = filePath.split(".")
								//	ext = ext[ext.length - 1]
								//}
								//console.log(fileobj)
								switch (ext) {
									//			_	  _	_   _
									//handle ssjs(Server Side JavaScript) files
									case "ssjs":
										if(thi.enable_ssjs){
											var removeFromCache=false
											try{
												var ssjsreq = require(filePath)
												if(!ssjsreq||ssjsreq.noCache){
													removeFromCache=true
												}
												if (ssjsreq) {
													var reqfun = ssjsreq.request || ssjsreq.start
													if (typeof reqfun == "function") {
														reqfun(req, res, jsext)
													}else{
														req.end("ssjs file missing request function")
														removeFromCache=true
													}
												}
											}catch(err){
												req.end("there was an error running the ssjs file")
												removeFromCache=true
											}
											if(removeFromCache){
												delete require.cache[require.resolve(filePath)]
											}
										}else{
											res.end("ssjs is disabled")
										}
										break

									default:
										var rscode = 200
										var contsize = stats.size
										if (!contsize && fileobj.data) {
											contsize = fileobj.data.length
										}
										
										if (absolute_file_pathdata.ext == "" && absolute_file_pathdata.isDirectory===false && fileobj.code == 404) {
											//console.log("hi")
											if(thi.cache_settings.enabled&&thi.cache_settings.auto_redirect_cache_time){
												var expires = new Date(nowtime +thi.cache_settings.auto_redirect_cache_time*1000);
												res.setHeader("Expires", expires.toUTCString())
											}
											var lastSection=url.split("/")
											lastSection=lastSection[lastSection.length-1]
											res.setHeader("Location", encodeURI(lastSection + "/"))
											res.writeHead(302)
											res.end()
										} else {

											if (fileobj.code == 404) {
												//console.log(stats.isDirectory(),filename)
												if (this.thi.auto_index_settings.enabled == true &&(absolute_file_stats?absolute_file_stats.isDirectory():false)) {
													
													//do autoindex on 404
													res.setHeader("Content-Type", "text/html")
													var autoindex = {
														columns: ["image", "link", "size"], //["image","link","size"]
														filenum: 0,
														filenumdone: 0,
														folders: [],
														files: [],
														html: "<!DOCTYPE html><html><head><meta charset='UTF-8'><style>" +
															".image{height:1.1em;vertical-align: middle;}" +
															"body{font-size:1.2em;}" +
															".np{padding:0px;}" +
															"" +
															"</style></head><body><table>\n",
														formatebytes: function(bytes) {
															var outnum = 0
															var outext = "B"
															var kilo = 1024
															var significantdigits = 4
															if (bytes >= Math.pow(kilo, 4)) {
																outnum = bytes / Math.pow(kilo, 4)
																outext = "TB"
															} else if (bytes >= Math.pow(kilo, 3)) {
																outnum = bytes / Math.pow(kilo, 3)
																outext = "GB"
															} else if (bytes >= Math.pow(kilo, 2)) {
																outnum = bytes / Math.pow(kilo, 2)
																outext = "MB"
															} else if (bytes >= Math.pow(kilo, 1)) {
																outnum = bytes / Math.pow(kilo, 1)
																outext = "KB"
															} else {
																outnum = bytes
																outext = "B"
															}
															var outtxt = outnum + " " + outext
															var spl = outnum.toString().split(".")
															if (spl.length == 2 && (outnum.toString().length > (significantdigits + 1))) {
																var decplaces = significantdigits - spl[0].length
																outtxt = spl[0]
																if (decplaces > 0) {
																	outtxt += "." + spl[1].substr(0, decplaces)
																}
																outtxt += " " + outext
															}
															return outtxt
														}
													}

													autoindex.gentableheaderhtml = function() {
															var ht = "<tr>"
															for (var x in autoindex.columns) {
																switch (autoindex.columns[x]) {
																	case "link":
																		ht += "<td>File Name</td>"
																		break

																	case "image":
																		ht += "<td></td>"
																		break

																	case "size":
																		ht += "<td>Size</td>"
																		break

																	case "test":
																		ht += "<td>test</td>"
																		break

																	case "":
																		ht += "<td></td>"
																		break


																}
															}
															ht += "</tr><td colspan=1000><hr/></td></tr>\n"
															return ht
														},
														autoindex.html += autoindex.gentableheaderhtml()

													autoindex.genfilehtml = function(file) {
															var ht = "<tr>"
															for (var x in autoindex.columns) {
																switch (autoindex.columns[x]) {
																	case "link":
																		if (file.stats.isDirectory()) {
																			ht += "<td><a href='" + (file.link || (file.name + "/")) + "'>" + file.name + "</a></td>"
																		} else {
																			ht += "<td><a href='" + (file.link || file.name) + "'>" + file.name + "</a></td>"
																		}
																		break

																	case "image":
																		var icon = ""
																		var auto_index_icon = thi.auto_index_icons[file.ext]
																		if (auto_index_icon) {
																			icon = auto_index_icon
																		} else {
																			icon = thi.auto_index_icons[".default"]
																		}
																		icon = thi.auto_index_settings.autoindex_icon_location + icon
																		ht += "<td class='np'><img class='image' src='" + icon + "' /></td>"
																		break

																	case "size":
																		if (file.stats.isDirectory()) {
																			ht += "<td></td>"
																		} else {
																			ht += "<td>" + autoindex.formatebytes(file.stats.size) + "</td>"
																		}
																		break

																	case "test":
																		//ht+="<td>"+JSON.stringify(file)+"</td>"
																		break

																	case "":
																		ht += "<td></td>"
																		break


																}
															}
															ht += "</tr>\n"
															return ht
														},

														autoindex.done = function() {
															autoindex.html += autoindex.genfilehtml({
																name: "Parent Directory",
																link: "../",
																ext: "../",
																stats: {
																	isDirectory: function() {
																		return true
																	}
																}
															})
															var sorter = function(a, b) {
																/*
																var nameA = a.name.toUpperCase()
																var nameB = b.name.toUpperCase()
																if (nameA < nameB) {
																	return -1
																}
																if (nameA > nameB) {
																	return 1
																}
																return 0
																*/
																return a.name.localeCompare(b.name, undefined, {
																	numeric: true
																})
															}
															if (thi.auto_index_settings.max_folders_for_sorting >= autoindex.folders.length) {
																autoindex.folders.sort(sorter)
															}
															if (thi.auto_index_settings.max_files_for_sorting >= autoindex.files.length) {
																autoindex.files.sort(sorter)
															}
															for (var x in autoindex.folders) {
																autoindex.html += autoindex.genfilehtml(autoindex.folders[x])
															}
															for (var x in autoindex.files) {
																autoindex.html += autoindex.genfilehtml(autoindex.files[x])

															}
															autoindex.html += "</table></body></html>"
															if(thi.cache_settings.enabled&&thi.cache_settings.auto_index_cache_time){
																var expires = new Date(nowtime +thi.cache_settings.auto_index_cache_time*1000);
																res.setHeader("Expires", expires.toUTCString())
															}
															res.write(autoindex.html)
															res.end()
														}

													fs.readdir(absolute_file, function(err, filesar) {

														for (var x in filesar) {
															var x2 = filesar[x]
															if (!thi.allow_file(x2)) {
																continue
															}
															autoindex.filenum++
																fs.stat(absolute_file + x2, (function(err, stats) {
																	autoindex.filenumdone++
																		if (!stats) {
																			//console.log(this.filename)
																			return
																		}
																	var file = {
																		name: this.filename,
																		stats: stats,
																		ext: ""
																	}
																	if (stats.isDirectory()) {
																		file.ext = ".directory"
																		autoindex.folders.push(file)
																	} else {
																		var spli = file.name.split(".").reverse()
																		if (spli.length > 1) {
																			file.ext = spli[0]
																		}
																		autoindex.files.push(file)
																	}
																	if (autoindex.filenum == autoindex.filenumdone) {
																		autoindex.done()
																	}
																}).bind({
																	filename: x2
																}))
														}
														if (autoindex.filenum == 0) {
															autoindex.done()
														}
													})
													break
												}

											}
											var dosend = true
											var contt = fileobj.mime || this.thi.mimetypes.get(ext)
											if (contt) {
												res.setHeader("Content-Type", contt)
											}
											if (isFile) {
												res.setHeader("Accept-Ranges", "bytes")
												var opts = {}
												//console.log(req)
												if (req.headers.range) {
													var spm = req.headers.range.split("=")
													if (spm[0] == "bytes" && spm[1]) {
														var spl = spm[1].split("-")
														if (Number(spl[0])) {
															opts.start = Number(spl[0])
														}
														if (Number(spl[1])) {
															opts.end = Number(spl[1])
														}
														res.setHeader("Content-Range", "bytes " + (opts.start || 0) + "-" + (opts.end || (stats.size - 1)) + "/" + (stats.size))
														rscode = 206
														contsize = (((opts.end || (stats.size ))-1) - (opts.start || 0)) + 1
														//console.log(opts)
													}
												}

												//opts.end=stats.size+1000
												//console.log(opts)
												res.setHeader("Content-Length", contsize)
												var cache_settings = thi.cache_settings
												if (cache_settings.enabled && req.allow_cache !== false) {
													//console.log(stats)
													var mtime = stats.mtimeMs
													if(mtime===undefined){
														mtime=Number(stats.mtime)
													}
													var etag = '"' + (mtime) + '"'
													var inm = req.headers["if-none-match"]
													if (inm) {
														var inm = inm.split(",")
														if (inm == etag) {
															dosend = false
															rscode = 304
														}
													}
													var now = nowtime

													var max_age = cache_settings.short_cache_time
													if ((mtime + (cache_settings.long_cache_cutoff * 1000)) < now) {
														max_age = cache_settings.long_cache_time
													}
													res.setHeader("Cache-Control", cache_settings.cacheability + ", max_age=" + Math.round(max_age))
													res.setHeader("X-Accel-Expires", Math.round(max_age))
													//res.setHeader("Cache-Control" ,"max_age="+Math.round(max_age))
													var expires = new Date(now + max_age * 1000);
													res.setHeader("Expires", expires.toUTCString())
													//res.setHeader("Age" ,"0")
													//console.log('"t'+mtime+'"')
													res.setHeader("ETag", etag)


												}

											}
											res.writeHead(fileobj.code || rscode)
											if (isFile) {
												if (dosend) {
													var stream = fs.createReadStream(filePath, opts)
													stream.pipe(res)
													//console.log(stream)
													function onresend() {
														//console.log(stream)
														if (stream.readable) {
															stream.destroy()
															//console.log("eeee")
														} else {

														}
													}
													stream.on("close", onresend)
													res.on("close", onresend)
													res.on("finish", onresend)
													//res.on("finish",function(){console.log("finished")})
													res.on("error", onresend)
												} else {
													res.end()
												}
											} else {
												if (fileobj.data) {
													res.write(fileobj.data)
													res.end()
												}
											}
										}
								}
							} else {
								this.fun()
							}
						}

					} else {
						if (absolute_file_pathdata.ext == "") {
							res.setHeader("Location", encodeURI(url + "/"))
							res.writeHead(302)
							res.end()
						} else {
							res.writeHead(500, "file system error")
							res.write("error:no file found")
							res.end()
						}
					}
				}).bind(thisa)
				thisa.fun = filrecur
				filrecur()
			} else {

				res.writeHead(500, "file system disabled")
				res.write("error")
				res.end()

			}
		}
		var startgetfromfs = function() {
			if(jsext.new_absolute_file!=false){
				absolute_file=jsext.new_absolute_file
				absolutefiledatafunction()
			}
			var bypass_in_directory_test = false
			if (thi.server_include_file_path) {
				var web_directory_inc = thi.web_directory
				if (web_directory_inc[web_directory_inc.length - 1] == "/" && thi.server_include_url[0] == "/") {
					web_directory_inc = web_directory_inc.substring(0, web_directory_inc.length - 1)
				}
				var absolute_include_in_webdir = resolvepath(web_directory_inc + thi.server_include_url)
				if (absolute_file.indexOf(absolute_include_in_webdir) == 0) {//if file is in server_include_url
					var include_file_path = resolvepath(thi.server_include_file_path)

					var url_inc = absolute_file.substr(absolute_include_in_webdir.length)
					//console.log(thi.server_include_file_path,include_file_path,url_inc)
					if (include_file_path[include_file_path.length - 1] == path.sep && url_inc[0] == path.sep) {
						include_file_path = include_file_path.substring(0, include_file_path.length - 1)
					}
					absolute_file = include_file_path + url_inc
					bypass_in_directory_test = true
				}
			}
			fs.stat(absolute_file, function(err, stats) {
				//console.log(absolute_file)
				absolute_file_stats = stats
				getfromfs.files = []
				//var url2 = url
				var cont = true

				//if (thi.secure_fs !== false) {
				if (true){
					var a = webdirpath
					if (absolute_file.indexOf(a) != 0 && bypass_in_directory_test !== true) {
						cont = false
						//url2 = "/" + thi.error_files[403]
						if (thi.error_files[403]) {
							getfromfs.files.push({
								file: (thi.error_files.use_include_file_path ? thi.server_include_file_path : webdirpath) + thi.error_files[403],
								code: 403
							})
						}
						if (thi.error_files_defaults[403]) {
							getfromfs.files.push({
								file: false,
								data: thi.error_files_defaults[403],
								code: 403
							})
						}

					}
				}

				//console.log(absolute_file)
				//var lastchar=absolute_file[absolute_file.length - 1]
				//var isslash=(lastchar == "/"||lastchar == "\\")
				if (!err) {
					if (stats.isDirectory() && cont) {
						for (var x in thi.index_files) {
							getfromfs.files.push({
								file: absolute_file + thi.index_files[x]
							})
						}
					} else if (cont) {
						getfromfs.files.push({
							file: absolute_file
						})
					}
				}
				if (thi.error_files[404] && cont) {
					getfromfs.files.push({
						file: (thi.error_files.use_include_file_path ? thi.server_include_file_path : webdirpath) + thi.error_files[404],
						code: 404
					})
				}
				if (cont) {
					getfromfs.files.push({
						file: false,
						data: thi.error_files_defaults[404],
						code: 404
					})
				}
				//for(var x in getfromfs.files)console.log(getfromfs.files[x])
				getfromfs()
			})
		}
		//getfromfs.files.push({file:"",function(){},code:404})
		var ar = []
		var nxt = (function() {
			var a = this.ar.splice(0, 1)[0]
			if (a) {} else {
				return
			}
			a[0].apply(null, a[1])
		}).bind({
			ar: ar
		})
		for (var x in this.urlhandles) {
			var x2 = this.urlhandles[x]
			if (absolute_file.indexOf(x2.fullpath) == 0) {
				ar.push([x2.callback, [req, res, nxt, jsext]])
			}
		}

		//ar.push([getfromfs, []])
		ar.push([startgetfromfs, []])
		//console.log(ar)
		nxt()

	}
	lightHTTP.clear_require_cache = function() {
		for (var key in require.cache) {
			require.cache[key] = null
			delete require.cache[key]
		}
	}
	lightHTTP.add_url_handle = function(url, callback /*callback(req,res,next)*/ ) {
		var urh = this.urlhandles
		//urh[url]=callback
		var web_directory = this.web_directory
		if (web_directory[web_directory.length - 1] == "/" && url[0] == "/") {
			web_directory = web_directory.substring(0, web_directory.length - 1)
		}
		urh.push({
			url: url,
			fullpath: resolvepath(web_directory + url),
			callback: callback
		})
	}
	lightHTTP.remove_url_handle = function(url) {
		var urh = this.urlhandles
		for (var x in urh) {
			if (urh[x].url == url) {
				urh[x] = null
				delete urh[x]
			}
		}
	}
	lightHTTP.allow_file = function(filename,ext) {
		var disallow = false
		if(filename&&!ext){
		var spl = filename.split(".").reverse()
		if(spl.length>1){
			ext = spl.splice(0, 1)[0].toLowerCase()
		}else{
			ext = ""
		}
		var name = spl.reverse().join() || name
		}
		//console.log(ext)
		if (support.includes) {
			disallow = disallow || lightHTTP.disabled_extentions.includes(ext)
		} else {
			for (var x in lightHTTP.disabled_extentions) {
				disallow = disallow || (lightHTTP.disabled_extentions[x] == ext)
			}
		}
		return !disallow
	}

	try {
		lightHTTP.mimetypes = require("./mimetypes.js")
	} catch (a) {
		lightHTTP.mimetypes = new Map()
	}
	try {
		var icons = require("./auto_index_icons.js")
		lightHTTP.auto_index_icons = {}
		for (var x in icons) {
			var exts = icons[x].split(" ")
			for (var y in exts) {
				lightHTTP.auto_index_icons[exts[y]] = x
			}
		}

	} catch (a) {
		lightHTTP.auto_index_icons = {}
	}
	lightHTTP.resolvepath = resolvepath
	return lightHTTP
}

function resolvepath(file) {
	var ds = false
	var lastCharecter=file[file.length - 1]
	if (lastCharecter == "/"||lastCharecter == "\\") {
		ds = true
	}
	file = path.resolve(file)
	if (ds && file[file.length - 1] != path.sep) {
		file += path.sep
	}
	return file
}
module.exports = newf