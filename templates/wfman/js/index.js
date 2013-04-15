$(document).ready(function()
{
	// declaration ---------------------------------------------------------
	/**
	 * find folder name of the specified path
	 *
	 * @param path
	 */
	var dirname = function(path)
	{
		var arr = path.split("/");
		arr.pop();
		return "/" + arr.join("/");
	};

	/**
	 * copy missing settings from conf to opts
	 *
	 * @param conf
	 * @param opts
	 */
	var initOpts = function(conf, opts)
	{
		opts || (opts = {});

		for(var i in conf)
			if (! opts.hasOwnProperty(i))
				opts[i] = conf[i];

		return opts;
	};

	/**
	 * find cookie specified by the name
	 *
	 * @param name cookie name to find
	 */
	var getCookie = function(name)
	{
		var out;
		if (document.cookie && document.cookie != "")
		{
			var cookies = document.cookie.split(";");
			for(var i = 0; i < cookies.length; i ++)
			{
				var cookie = $.trim(cookies[i]);
				if (cookie.substring(0, name.length + 1) == (name + "="))
				{
					out = decodeURIComponent(cookie.substring(name.length + 1));
					break;
				}
			}
		}
		return out;
	};

	/**
	 * load and display folder / file list
	 *
	 * @param path path to be loaded and displayed
	 */
	var loadList = function(path)
	{
		path || (path = '');

		$.ajax
		(
			"{% url 'wfman:list' '' %}" + encodeURIComponent(path)
			, {
				dataType: 'html'
				, success: function(data)
				{
					$("#FoldersList").html(data);
					buffer = [];
				}
				, error: function(txt)
				{
					$("#FoldersList").text(txt);
				}
			}
		);
	};

	/**
	 * open and display dialog window
	 *
	 * @param data string or XMLHttpResponse contents to be displayed
	 * @param t title of the dialog
	 */
	var dialog = function(data, t)
	{
		var txt = data;
		if ("string" != typeof(txt))
		{
			if (txt.hasOwnProperty("responseText"))
				txt = txt.responseText;
			else
				txt = JSON.stringify(txt);
		}

		var opts = {close: function(evt, ui){$(this).remove();}};
		if (t) opts = initOpts({title: t, modal: true}, opts);

		var eDlg = $("#FoldersDialog").clone();
		eDlg.removeAttr("id");
		$("body").append(eDlg);

		eDlg.text(txt);
		eDlg.dialog(opts);
		eDlg.dialog("open");
	};

	/**
	 * init or update progress bar
	 *
	 * @param val object: options for init; number: value for update
	 */
	var pbar = function(val)
	{
		if ("object" == typeof val)
		{
			var conf =
			{
				title: "Progress Bar"
				, complete: function(evt, ui)
				{
					$("#FoldersProgressbarDialog").dialog("close");
				}
			};

			o = initOpts(conf, val);

			$("#FoldersProgressbarDialog").dialog({title: o.title});

			delete o["title"];

			$("#FoldersProgressbar").progressbar(o);
			$("#FoldersProgressbarDialog").dialog("open");
		}
		else
		{
			$("#FoldersProgressbar").progressbar("option", "value", val);
		}
	};

	/**
	 * access URL asynchronously
	 *
	 * @param url URL to be accessed
	 * @param title title of the popup when access finished
	 * @param opts options to be applied for AJAX access
	 */
	var bgRun = function(url, title, opts)
	{
		title || (title = "Dialog")

		var conf = {
			dataType: 'text'
			, success: function(data){dialog(data, title);}
			, error: function(data){dialog(data, title + " - Error");}
		};

		$.ajax(url, initOpts(conf, opts));
	};

	/**
	 * copy folder(s) and/or file(s) to dst
	 *
	 * @param arr folder(s) and/or file(s) to be copied
	 * @param dst destination folder
	 */
	var bgCopy = function(arr, dst)
	{
		if (! arr instanceof Array) arr = [arr];

		var csrftoken = getCookie("csrftoken");
		var len = arr.length;
		var done = 0;

		pbar({
			title: "Copying..."
			, max: len
			, complete: function(evt, ui)
			{
				loadList(dst);
			}
		});

		for(i in arr)
		{
			var path = arr[i];

			bgRun
			(
				"{% url 'wfman:copy' %}"
				, null
				, {
					type: 'POST'
					, headers: {
						"X-CSRFToken": csrftoken
					}
					, dataType: 'text'
					, data: {
						from: path
						, to: dst
					}
					, success: function(data)
					{
						done ++;
						pbar(done);
					}
					, error: function(data)
					{
						dialog(data, "Copying... - Error");
						done ++;
						pbar(done);
					}
				}
			);
		}
	};

	/**
	 * move folder(s) and/or file(s) to dst
	 *
	 * @param arr folder(s) and/or file(s) to be moved
	 * @param dst destination folder
	 */
	var bgMove = function(arr, dst)
	{
		if (! arr instanceof Array) arr = [arr];

		var csrftoken = getCookie("csrftoken");
		var len = arr.length;
		var done = 0;

		pbar({
			title: "Moving..."
			, max: len
			, complete: function(evt, ui)
			{
				loadList(dst);
			}
		});

		for(i in arr)
		{
			var path = arr[i];

			bgRun
			(
				"{% url 'wfman:move' %}"
				, null
				, {
					type: 'POST'
					, headers: {
						"X-CSRFToken": csrftoken
					}
					, dataType: 'text'
					, data: {
						from: path
						, to: dst
					}
					, success: function(data)
					{
						done ++;
						pbar(done);
					}
					, error: function(data)
					{
						dialog(data, "Moving... - Error");
						done ++;
						pbar(done);
					}
				}
			);
		}
	};

	/**
	 * delete folder(s) and/or file(s)
	 *
	 * @param arr folder(s) and/or file(s) to be deleted
	 */
	var bgDelete = function(arr)
	{
		{# single file #}
		if ("string" == typeof arr)
		{
			var path = arr;

			bgRun
			(
				"{% url 'wfman:delete' '' %}" + encodeURIComponent(path)
				, null
				, {
					success: function(data)
					{
						dialog(data, "Delete");
						loadList(dirname(path));
					}
				}
			);

			return;
		}

		{# batch processing #}
		var len = arr.length;
		var done = 0;

		pbar({
			title: "Deleting..."
			, max: len
			, complete: function(evt, ui)
			{
				loadList(dirname(arr[0]));
			}
		});

		for(i in arr)
		{
			var path = arr[i];

			bgRun
			(
				"{% url 'wfman:delete' '' %}" + encodeURIComponent(path)
				, null
				, {
					dataType: 'text'
					, success: function(data)
					{
						done ++;
						pbar(done);
					}
					, error: function(data)
					{
						dialog(data, "Deleting... - Error");
						done ++;
						pbar(done);
					}
				}
			);
		}
	};

	/**
	 * create folder specified by the path
	 *
	 * @param dst full path of the folder to create
	 */
	var bgNewdir = function(dst)
	{
		bgRun
		(
			"{% url 'wfman:newdir' '' %}" + encodeURIComponent(dst)
			, null
			, {
				success: function(data)
				{
					dialog(data, "Create");
					loadList(dirname(dst));
				}
			}
		);
	};

	/**
	 * upload file
	 */
	var bgUpload = function()
	{
		var csrftoken = getCookie("csrftoken");
		var fd = new FormData(document.getElementById("TheUploadForm"));
		var curpath = $("#CurrentPath").attr("value");
		fd.append("path", curpath);

		bgRun
		(
			"{% url 'wfman:upload' %}"
			, null
			, {
				type: "POST"
				, headers: {
					"X-CSRFToken": csrftoken
				}
				, data: fd
				, processData: false
				, contentType: false
				, success: function(d)
				{
					dialog(d, "Upload");
					loadList(curpath);
				}
			}
		);
	};

	var buffer = [];
	var clipboard = {};

	/**
	 * put folder and file names to clipboard for copy operation
	 *
	 * @param s present: copy string to clipboard directly;
	 *          absent: move buffer contents to clipboard
	 */
	var copy = function(s)
	{
		if (s)
		{
			clipboard = {copy: [s]};
		}
		else if (buffer.length)
		{
			clipboard = {copy: buffer};
			buffer = [];
			$("#FoldersList div.fnode").removeClass("chosen");
		}
	};

	/**
	 * put folder and file names to clipboard for cut operation
	 *
	 * @param s present: copy string to clipboard directly;
	 *          absent: move buffer contents to clipboard
	 */
	var cut = function(s)
	{
		if (s)
		{
			clipboard = {cut: [s]};
		}
		else if (buffer.length)
		{
			clipboard = {cut: buffer};
			buffer = [];
			$("#FoldersList div.fnode").removeClass("chosen");
		}
	};

	/**
	 * delete folder and file
	 *
	 * @param s present: copy string to clipboard directly;
	 *          absent: delete folder(s) and/or file(s) indicated by the
	 *                  names in buffer
	 */
	var del = function(s)
	{
		if (s)
		{
			clipboard = {del: [s]};
		}
		else if (buffer.length)
		{
			bgDelete(buffer);
			buffer = [];
		}
	};

	/**
	 * paste folder(s) and/or file(s) to current folder
	 */
	var paste = function()
	{
		var path = $("#CurrentPath").attr("value");

		if (clipboard["copy"])
		{
			bgCopy(clipboard["copy"], path);
			clipboard = {};
		}
		else if (clipboard["cut"])
		{
			bgMove(clipboard["cut"], path);
			clipboard = {};
		}
	};

	/**
	 * display contents indicated by the url with Shadowbox
	 *
	 * @param url
	 */
	var showcase = function(url)
	{
		var arr = url.split("/");
		var fn = arr[arr.length - 1];
		var wk = fn.split(".");
		var ext = wk[wk.length - 1];

		switch(ext.toLowerCase())
		{
		case "flv":
		case "m4v":
			playertype= "flv";
			break;
		case "html":
			playertype = "html";
			break;
		case "bmp":
		case "gif":
		case "jpg":
		case "jpeg":
		case "png":
			playertype = "img";
			break;
		case "dv":
		case "mov":
		case "moov":
		case "movie":
		case "mp4":
		case "avi":
		case "mpg":
		case "mpeg":
			playertype = "qt";
			break;
		case "swf":
			playertype = "swf";
			break;
		default:
			playertype = "iframe";
		};

		Shadowbox.open
		({
			content: url
			, title: fn
			, player: playertype
		});
	};

	/**
	 * create new folder in current folder
	 *
	 * @param s name of the new folder
	 */
	var newdir = function(s)
	{
		var path = $("#CurrentPath").attr("value")
			+ "/" + s.replace("^\/+|\/+$", "") + "/";

		bgNewdir(path);
	};

	// initialization ------------------------------------------------------
	$("#FoldersList").delegate
	(
		"#BtnNew"
		, "click"
		, function(){$("#FoldersNewdirForm").dialog("open");}
	);
	$("#FoldersList").delegate
	(
		"#BtnUpload"
		, "click"
		, function(){$("#FoldersUploadForm").dialog("open");}
	);
	$("#FoldersList").delegate("#BtnCopy", "click", function(){copy();});
	$("#FoldersList").delegate("#BtnCut", "click", function(){cut();});
	$("#FoldersList").delegate("#BtnDelete", "click", function(){del();});
	$("#FoldersList").delegate("#BtnPaste", "click", function(){paste();});

	$("#FoldersList").delegate
	(
		"#CurrentPath"
		, "click"
		, function(){loadList($(this).attr("value"));}
	);

	$("#FoldersList").delegate
	(
		"a.listnav"
		, "click"
		, function(){loadList($(this).attr("value"));}
	);

	$("#FoldersList").delegate
	(
		"div.fnode"
		, "click"
		, function()
		{
			var val = $(this).attr("value");
			var idx = buffer.indexOf(val);

			if (-1 < idx)
			{
				buffer.splice(idx, 1);
				$(this).removeClass("chosen");
			}
			else
			{
				buffer.push(val);
				$(this).addClass("chosen");
			}
		}
	);

	$("#FoldersList").delegate
	(
		"div.fnode > a"
		, "click"
		, function(e)
		{
			e.stopPropagation();

			switch($(this).attr("type"))
			{
			case "dir":
				loadList($(this).attr("value"));
				break;
			case "file":
				showcase($(this).attr("value"));
				break;
			default:
			}
		}
	);

	$("#FoldersDialog").dialog({autoOpen: false});
	$("#FoldersProgressbarDialog").dialog({autoOpen: false});
	$("#FoldersNewdirForm").dialog
	({
		autoOpen: false
		, modal: true
		, width: 400
		, buttons: {
			"Create": function()
			{
				var re = /^[0-9a-z_]+$/i;
				var msg = "";
				var fname = $("#FoldersNewdirForm input[name='fname']").val();

				$("#FoldersNewdirForm .errmsg").text(msg);

				if (! re.test(fname))
					msg += "Alphanumeric characters and underscores only.\n";

				if (msg == "")
				{
					newdir(fname);
					$("#FoldersNewdirForm input[name='fname']").val("");
					$(this).dialog("close");
				}
				else
				{
					$("#FoldersNewdirForm .errmsg").text(msg);
				}
			}
			, "Cancel": function()
			{
				$(this).dialog("close");
			}
		}
		, close: function()
		{
			$("#FoldersNewdirForm .errmsg").text("");
		}
	});
	$("#FoldersUploadForm").dialog
	({
		autoOpen: false
		, modal: true
		, width: 475
		, buttons: {
			"Upload": function()
			{
				bgUpload();
				$(this).dialog("close");
			}
			, "Cancel": function()
			{
				$(this).dialog("close");
			}
		}
		, close: function()
		{
			$("#FoldersUploadForm input[type='file']").val("");
		}
	});

	Shadowbox.init({skipSetup: true});

	loadList();
});
