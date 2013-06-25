var api, ltrans = {};

function API(publish) {
	this.publish = publish;
	this.createHeader();
}

API.prototype.log = function (msg) {
	if (!this.publish) console.log(msg);
};

API.prototype.translate = function (text) {
	var t = ltrans[text];
	return t ? t : text;
};

API.prototype.isDupe = function (group, id) {
	for (var n = 0; n < group.length; n++)
		if (group[n].id == id) return true;
	return false;
};

API.prototype.isDupe = function (group, id) {
	for (var n = 0; n < group.length; n++)
		if (group[n].id == id) return true;
	return false;
};

API.prototype.makeIntArray = function (name, a) {
	var n, ia;

	if (a.length) {
		ia = a.split(",");
		for (n = 0; n < ia.length; n++)
			if (isNaN(ia[n] = parseInt(ia[n]))) {
				this.log("Attribute '" + name + "' value '" + a + "' contains non-numeric element.");
				return undefined;
			}
	}
	else
		ia = [];

	return ia;
};

API.prototype.cvtBool = function (name, value, default_) {
	var result = (value == "on" || value == "yes") ? true :
		(value == "off" || value == "no") ? false :
			!value ? default_ : undefined;

	if (result === undefined)
		this.log("Attribute '" + name + "' has invalid value '" + value + "'");

	return result;
};

API.prototype.cvtEnum = function (name, value, valid, integer, default_) {
	var n, result;

	if (value) {
		for (n = 0; n < valid.length; n++)
			if (value == valid[n]) {
				result = integer ? n : value;
				break;
			}
	}
	else
		value = default_;

	if (result === undefined)
		this.log("Attribute '" + name + "' has invalid value '" + value + "'");

	return result;
};

API.prototype.cvtNum = function (name, isInt, value, min, max, default_) {
	var result;

	if (value !== undefined) {
		if (isNaN(result = isInt ? parseInt(value) : parseFloat(value))) {
			this.log("Attribute '" + name + "' value '" + value + "' is not numeric.");
			result = undefined;
		}
		else if (min !== undefined && result < min) {
			this.log("Attribute '" + name + "' value '" + value + "' exceeds mininum.");
			result = undefined;
		}
		else if (max !== undefined && result > max) {
			this.log("Attribute '" + name + "' value '" + value + "' exceeds maximum.");
			result = undefined;
		}
	}
	else
		result = default_;

	return result;
};

API.prototype.getFormat = function (fmt) {
	switch (fmt) {
		case "$":
			return curf;
		case "%":
			return pctf;
		case ".":
			return numf;
		default:
			return intf;
	}
};

API.prototype.getChartPartCount = function (id, parts) {
	var n, count;
	for (n = 0, count = 0; n < parts.length; n++)
		if (parts[n].p == id) count++;
	return count;
};

API.prototype.getSnippet = function (elem, name) {
	var n, c;

	for (n = 0, c = elem.children; n < c.length; n++)
		if (c[n].nodeName == "DI_SNIPPET")
			if (c[n].attributes[0].value == name)
				return c[n];
};

API.prototype.validShareFrom = ["report", "dash"];

API.prototype.parseChildren = function (elem, func, isDim) {
	var n, n2, c, attr, from, name, e;

	for (n = 0, c = elem.children; n < c.length; n++)
		switch (c[n].nodeName) {
			case "DI_SNIPPET":
				for (n2 = 0, attr = c[n].attributes; n2 < attr.length; n2++)
					switch (attr[n2].nodeName) {
						case "from":
							from = this.cvtEnum("from", attr[n2].value, this.validShareFrom);
							break;
						case "name":
							name = attr[n2].value;
							break;
						default:
							this.log("Unknown <di_snippet> attribute '" + attr[n2].nodeName + "'.")
					}

				if (!name)
					this.log("<di_snippet> attribute 'name' is required.");

				if (e = this.getSnippet($(from == "report" ? "di_active_report" : "di_active_dashboard")[0], name))
					for (n2 = 0; n2 < e.children.length; n2++)
						func.call(this, e.children[n2], isDim);
				else
					this.log("Code '" + name + "' not found.");
				break;
			default:
				func.call(this, c[n], isDim);
		}
};

API.prototype.validLabelSource = ["data", "colhdr", "rowhdr"];

API.prototype.tagDashOptions = function (elem, options) {
	var n, attr = elem.attributes;

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "tabwidth":
				options.tabWidth = this.cvtNum("tabWidth", true, attr[n].value, 10, 200);
				break;
			case "minwidth":
				options.minWidth = this.cvtNum("minWidth", true, attr[n].value, 0);
				break;
			case "minheight":
				options.minHeight = this.cvtNum("minHeight", true, attr[n].value, 0);
				break;
			case "pagable":
				options.pagable = this.cvtBool("pagable", attr[n].value);
				break;
			case "showday":
				options.showDay = this.cvtBool("showday", attr[n].value);
				break;
			default:
				this.log("Unknown <di_options> attribute '" + attr[n].nodeName + "'.")
		}

	if (elem.children.length)
		this.log("<di_options> contains unknown child tags.");
};

API.prototype.tagDashDialsDial = function (elem, dials) {
	var n, attr = elem.attributes, dial = { format:intf };

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "label":
				dial.label = this.translate(attr[n].value);
				break;
			case "min":
				dial.min = this.cvtNum("min", true, attr[n].value);
				break;
			case "max":
				dial.max = this.cvtNum("max", true, attr[n].value);
				break;
			case "column":
				dial.column = this.cvtNum("column", true, attr[n].value, 0);
				break;
			case "row":
				dial.row = this.cvtNum("row", true, attr[n].value, 0);
				break;
			case "format":
				dial.format = this.getFormat(this.cvtEnum("format", attr[n].value, this.validFormat));
				break;
			default:
				this.log("Unknown <di_dial> attribute '" + attr[n].nodeName + "'.")
		}

	if (!dial.label || dial.min == undefined || dial.max == undefined || dial.column == undefined || dial.row == undefined)
		this.log("<di_dial> attributes 'label','min','max','column', and 'row' are required.");
	else if (elem.children.length)
		this.log("<di_dial> contains unknown child tags.");

	dials.push(dial);
};

API.prototype.tagDashDials = function (elem, controls) {
	var n, attr = elem.attributes, ctrl = { p:"dial", dials:[] };

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "tabcaption":
				ctrl.tabCaption = this.translate(attr[n].value);
				break;
			case "pos":
				ctrl.pos = attr[n].value;
				break;
			case "query":
				ctrl.qid = attr[n].value;
				break;
			case "caption":
				ctrl.caption = this.translate(attr[n].value);
				break;
			case "columns":
				ctrl.columns = this.cvtNum("columns", true, attr[n].value, 1, 99);
				break;
			case "coloffset":
				ctrl.colOffset = this.cvtNum("coloffset", true, attr[n].value, 0);
				break;
			case "fixed":
				ctrl.fixed = this.cvtNum("fixed", true, attr[n].value, 0);
				break;
			default:
				this.log("Unknown <di_dials> attribute '" + attr[n].nodeName + "'.")
		}

	if (!ctrl.tabCaption || !ctrl.pos || ctrl.columns == undefined)
		this.log("<di_dials> attributes 'tabcaption','pos' and 'columns' are required.");
	else
		this.parseChildren(elem, function (c) {
			switch (c.nodeName) {
				case "DI_DIAL":
					this.tagDashDialsDial(c, ctrl.dials);
					break;
				default:
					this.log("Unknown dials tag <" + c.nodeName.toLowerCase() + ">.")
			}
		});

	controls.push(ctrl);
};

API.prototype.tagDashNumbersNumber = function (elem, numbers) {
	var n, attr = elem.attributes, number = { format:intf };

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "label":
				number.label = this.translate(attr[n].value);
				break;
			case "column":
				number.column = this.cvtNum("column", true, attr[n].value, 0);
				break;
			case "row":
				number.row = this.cvtNum("row", true, attr[n].value, 0);
				break;
			case "column2":
				number.column2 = this.cvtNum("column2", true, attr[n].value, 0);
				break;
			case "row2":
				number.row2 = this.cvtNum("row2", true, attr[n].value, 0);
				break;
			case "format":
				number.format = this.getFormat(this.cvtEnum("format", attr[n].value, this.validFormat));
				break;
			default:
				this.log("Unknown <di_number> attribute '" + attr[n].nodeName + "'.")
		}

	if (!number.label || number.column == undefined || number.row == undefined)
		this.log("<di_number> attributes 'label','column' and 'row' are required.");
	else if (elem.children.length)
		this.log("<di_number> contains unknown child tags.");

	numbers.push(number);
};

API.prototype.tagDashNumbers = function (elem, controls) {
	var n, attr = elem.attributes, ctrl = { p:"numbers", columns:1, numbers:[] };

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "tabcaption":
				ctrl.tabCaption = this.translate(attr[n].value);
				break;
			case "pos":
				ctrl.pos = attr[n].value;
				break;
			case "query":
				ctrl.qid = attr[n].value;
				break;
			case "caption":
				ctrl.caption = this.translate(attr[n].value);
				break;
			case "columns":
				ctrl.columns = this.cvtNum("columns", true, attr[n].value, 1, 99);
				break;
			case "zero":
				ctrl.zero = this.cvtNum("zero", false, attr[n].value, 0);
				break;
			case "xmargin":
				ctrl.xMargin = this.cvtNum("xmargin", false, attr[n].value, 0);
				break;
			case "ymargin":
				ctrl.yMargin = this.cvtNum("ymargin", false, attr[n].value, 0);
				break;
			case "coloffset":
				ctrl.colOffset = this.cvtNum("coloffset", true, attr[n].value, 0);
				break;
			case "fixed":
				ctrl.fixed = this.cvtNum("fixed", true, attr[n].value, 0);
				break;
			default:
				this.log("Unknown <di_numbers> attribute '" + attr[n].nodeName + "'.")
		}

	if (!ctrl.tabCaption || !ctrl.pos)
		this.log("<di_numbers> attributes 'tabcaption' and 'pos' are required.");
	else
		this.parseChildren(elem, function (c) {
			switch (c.nodeName) {
				case "DI_NUMBER":
					this.tagDashNumbersNumber(c, ctrl.numbers);
					break;
				default:
					this.log("Unknown numbers tag <" + c.nodeName.toLowerCase() + ">.")
			}
		});

	controls.push(ctrl);
};

API.prototype.tagDashTableHeader1 = function (elem, hdr) {
	var n, attr = elem.attributes, h = { width:50 };

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "width":
				h.width = this.cvtNum("width", true, attr[n].value, 0, 3000);
				break;
			case "text":
				h.text = this.translate(attr[n].value);
				break;
			default:
				this.log("Unknown <di_chart_header1> attribute '" + attr[n].nodeName + "'.")
		}

	if (!h.text)
		this.log("<di_table_header1> attribute 'text' is required.");
	else if (elem.children.length)
		this.log("<di_chart_header1> contains unknown child tags.");

	hdr.push(h);
};

API.prototype.validColType = ["n", "s", "t"];

API.prototype.tagDashTableHeader2 = function (elem, hdr) {
	var n, attr = elem.attributes, h = { width:50, just:"end", format:intf };

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "width":
				h.width = this.cvtNum("width", true, attr[n].value, 0, 3000);
				break;
			case "column":
				h.col = this.cvtNum("column", true, attr[n].value, -999, 999);
				break;
			case "text":
				h.text = this.translate(attr[n].value);
				break;
			case "just":
				h.just = this.cvtEnum("just", attr[n].value, this.validJust);
				break;
			case "columntype":
				h.colType = this.cvtEnum("columntype", attr[n].value, this.validColType, true);
				break;
			case "format":
				h.format = this.getFormat(this.cvtEnum("format", attr[n].value, this.validFormat));
				break;
			default:
				this.log("Unknown <di_chart_header2> attribute '" + attr[n].nodeName + "'.")
		}

	if (!h.text)
		this.log("<di_table_header2> attribute 'text' is required.");
	else if (elem.children.length)
		this.log("<di_chart_header2> contains unknown child tags.");

	hdr.push(h);
};

API.prototype.tagDashTable = function (elem, controls) {
	var n, attr = elem.attributes, ctrl = { p:"table", layout:{ rowWidth:150, rowHeight:18, hdr1:[], hdr2:[] } };

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "tabcaption":
				ctrl.tabCaption = this.translate(attr[n].value);
				break;
			case "pos":
				ctrl.pos = attr[n].value;
				break;
			case "query":
				ctrl.qid = attr[n].value;
				break;
			case "rowwidth":
				ctrl.layout.rowWidth = this.cvtNum("rowwidth", true, attr[n].value, 5, 999);
				break;
			case "rowheight":
				ctrl.layout.rowHeight = this.cvtNum("rowheight", true, attr[n].value, 5, 99);
				break;
			case "caption":
				ctrl.caption = this.translate(attr[n].value);
				break;
			case "chart":
				ctrl.cid = attr[n].value;
				break;
			case "coloffset":
				ctrl.colOffset = this.cvtNum("coloffset", true, attr[n].value, 0);
				break;
			case "fixed":
				ctrl.fixed = this.cvtNum("fixed", true, attr[n].value, 0);
				break;
			default:
				this.log("Unknown <di_table> attribute '" + attr[n].nodeName + "'.")
		}

	if (!ctrl.tabCaption || !ctrl.pos)
		this.log("<di_table> attributes 'tabcaption' and 'pos' are required.");
	else
		this.parseChildren(elem, function (c) {
			switch (c.nodeName) {
				case "DI_TABLE_HEADER1":
					this.tagDashTableHeader1(c, ctrl.layout.hdr1);
					break;
				case "DI_TABLE_HEADER2":
					this.tagDashTableHeader2(c, ctrl.layout.hdr2);
					break;
				default:
					this.log("Unknown table tag <" + c.nodeName.toLowerCase() + ">.")
			}
		});

	controls.push(ctrl);
};

API.prototype.tagDashChartLabels = function (elem, labels) {
	var n, attr = elem.attributes, l = { source:0, row:-1, format:intf };

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "source":
				l.source = this.cvtEnum("source", attr[n].value, this.validLabelSource, true);
				break;
			case "maxchars":
				l.maxchars = this.cvtNum("maxchars", true, attr[n].value, 1, 99);
				break;
			case "xoffset":
				l.xoffset = this.cvtNum("xoffset", false, attr[n].value);
				break;
			case "yoffset":
				l.yoffset = this.cvtNum("yoffset", false, attr[n].value);
				break;
			case "format":
				l.format = this.getFormat(this.cvtEnum("format", attr[n].value, this.validFormat));
				break;
			case "row":
				l.row = this.cvtNum("row", true, attr[n].value, 0, 99);
				break;
			default:
				this.log("Unknown <di_chart_labels> attribute '" + attr[n].nodeName + "'.")
		}

	if (elem.children.length)
		this.log("<di_chart_labels> contains unknown child tags.");

	labels.push(l);
};

API.prototype.tagDashChartColor = function (elem, colors) {
	var n, attr = elem.attributes, c = { };

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "fill":
				c.fill = attr[n].value.toLowerCase();
				break;
			case "stroke":
				c.stroke = attr[n].value.toLowerCase();
				break;
			case "strokewidth":
				c.strokewidth = attr[n].value.toLowerCase();
				break;
			case "opacity":
				c.opacity = this.cvtNum("opacity", false, attr[n].value, 0, 1);
				break;
			default:
				this.log("Unknown <di_chart_color> attribute '" + attr[n].nodeName + "'.")
		}

	if (elem.children.length)
		this.log("<di_chart_color> contains unknown child tags.");

	colors.push(c);
};

API.prototype.tagDashChartHeader = function (elem, parts) {
	var n, attr = elem.attributes, p = { p:"header", series:[0], labels:[], offset:-10, zero:0 };

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "series":
				p.series = this.makeIntArray("series", attr[n].value);
				break;
			case "type":
				p.type = attr[n].value;
				break;
			case "text":
				p.text = attr[n].value;
				break;
			case "offset":
				p.offset = this.cvtNum("offset", true, attr[n].value);
				break;
			case "zero":
				p.zero = this.cvtNum("zero", true, attr[n].value);
				break;
			case "range2":
				p.range2 = this.cvtBool("range2", attr[n].value);
				break;
			case "query":
				p.qid = this.attr[n].value.toLowerCase();
				break;
			default:
				this.log("Unknown <di_chart_header> attribute '" + attr[n].nodeName + "'.")
		}

	if (!p.type)
		this.log("<di_drawer_text> attribute 'type' is required.");
	else if (elem.children.length)
		this.log("<di_chart_header> contains unknown child tags.");

	parts.push(p);
};

API.prototype.validShape = ["triangle", "square", "diamond", "circle", "hline", "vline"];

API.prototype.tagDashChartShape = function (elem, parts) {
	var n, attr = elem.attributes, p = { p:"shape", series:[0], colors:[], labels:[], shape:0, maxradius:5 };

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "series":
				p.series = this.makeIntArray("series", attr[n].value);
				break;
			case "shape":
				p.shape = this.cvtEnum("shape", attr[n].value, this.validShape, true);
				break;
			case "minradius":
				p.minradius = this.cvtNum("minradius", false, attr[n].value, 0);
				break;
			case "maxradius":
				p.maxradius = this.cvtNum("maxradius", false, attr[n].value, 0);
				break;
			case "offset":
				p.offset = this.cvtNum("offset", false, attr[n].value);
				break;
			case "range2":
				p.range2 = this.cvtBool("range2", attr[n].value);
				break;
			case "query":
				p.qid = this.attr[n].value.toLowerCase();
				break;
			case "events":
				p.events = this.cvtBool("events", attr[n].value);
				break;
			default:
				this.log("Unknown <di_chart_shape> attribute '" + attr[n].nodeName + "'.")
		}

	this.parseChildren(elem, function (c) {
		switch (c.nodeName) {
			case "DI_CHART_COLOR":
				this.tagDashChartColor(c, p.colors);
				break;
			case "DI_CHART_LABELS":
				this.tagDashChartLabels(c, p.labels);
				break;
			default:
				this.log("Unknown shape tag <" + c.nodeName.toLowerCase() + ">.")
		}
	});

	if (!p.colors.length)
		this.log("<di_chart_shape> does not contain any colors.");
	else if (p.labels.length > 1)
		this.log("<di_chart_shape> has multiple <di_chart_labels> tags.");
	else
		parts.push(p);
};

API.prototype.tagDashChartLine = function (elem, parts) {
	var n, attr = elem.attributes, p = { p:"line", series:[0], colors:[], labels:[] };

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "series":
				p.series = this.makeIntArray("series", attr[n].value);
				break;
			case "fill":
				p.fill = this.cvtBool("fill", attr[n].value);
				break;
			case "range2":
				p.range2 = this.cvtBool("range2", attr[n].value);
				break;
			case "query":
				p.qid = this.attr[n].value.toLowerCase();
				break;
			case "events":
				p.events = this.cvtBool("events", attr[n].value);
				break;
			default:
				this.log("Unknown <di_chart_line> attribute '" + attr[n].nodeName + "'.")
		}

	this.parseChildren(elem, function (c) {
		switch (c.nodeName) {
			case "DI_CHART_COLOR":
				this.tagDashChartColor(c, p.colors);
				break;
			case "DI_CHART_LABELS":
				this.tagDashChartLabels(c, p.labels);
				break;
			default:
				this.log("Unknown line tag <" + c.nodeName.toLowerCase() + ">.")
		}
	});

	if (!p.colors.length)
		this.log("<di_chart_line> does not contain any colors.");
	else if (p.labels.length > 1)
		this.log("<di_chart_line> has multiple <di_chart_labels> tags.");
	else
		parts.push(p);
};

API.prototype.tagDashChartBar = function (elem, parts) {
	var n, attr = elem.attributes, p = { p:"bar", series:[0], colors:[], labels:[] };

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "series":
				p.series = this.makeIntArray("series", attr[n].value);
				break;
			case "width":
				p.width = this.cvtNum("width", false, attr[n].value);
				break;
			case "offset":
				p.offset = this.cvtNum("offset", false, attr[n].value);
				break;
			case "span":
				p.span = this.cvtNum("span", false, attr[n].value);
				break;
			case "range2":
				p.range2 = this.cvtBool("range2", attr[n].value);
				break;
			case "query":
				p.qid = this.attr[n].value.toLowerCase();
				break;
			case "events":
				p.events = this.cvtBool("events", attr[n].value);
				break;
			default:
				this.log("Unknown <di_chart_bar> attribute '" + attr[n].nodeName + "'.")
		}

	this.parseChildren(elem, function (c) {
		switch (c.nodeName) {
			case "DI_CHART_COLOR":
				this.tagDashChartColor(c, p.colors);
				break;
			case "DI_CHART_LABELS":
				this.tagDashChartLabels(c, p.labels);
				break;
			default:
				this.log("Unknown bar tag <" + c.nodeName.toLowerCase() + ">.")
		}
	});

	if (!p.colors.length)
		this.log("<di_chart_bar> does not contain any colors.");
	else if (p.labels.length > 1)
		this.log("<di_chart_bar> has multiple <di_chart_labels> tags.");
	else
		parts.push(p);
};

API.prototype.tagDashChartSeries = function (elem, parts) {
	var n, n2, attr = elem.attributes, p = { p:"series", separator:" ", series:0 };

	if (this.getChartPartCount("series", parts)) {
		this.log("<di_chart_series> appears more than once.");
		return;
	}

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "caption":
				p.caption = this.translate(attr[n].value);
				break;
			case "series":
				p.series = this.cvtNum("series", true, attr[n].value, 0, 9);
				break;
			case "inset":
				p.inset = this.cvtBool("inset", attr[n].value);
				break;
			case "separator":
				p.separator = attr[n].value;
				if (p.separator == "<br>") p.separator = "\n";
				break;
			case "labeloffset":
				p.labeloffset = this.cvtNum("labeloffset", true, attr[n].value, -99, 99);
				break;
			case "labelangle":
				p.labelangle = this.cvtNum("labelangle", true, attr[n].value, 0, 90);
				break;
			case "customlabels":
				p.customlabels = this.translate(attr[n].value).replace(/<br>/gi, "\n").split(",");
				for (n2 = 0; n2 < p.customlabels.length; n2++)
					p.customlabels[n2] = p.customlabels[n2];
				break;
			default:
				this.log("Unknown <di_chart_series> attribute '" + attr[n].nodeName + "'.")
		}

	if (elem.children.length)
		this.log("<di_chart_series> contains unknown child tags.");

	parts.push(p);
};

API.prototype.validFormat = ["#", ".", "$", "%"];
API.prototype.validOrient = ["left", "top", "right", "bottom"];

API.prototype.tagDashChartRange = function (elem, parts) {
	var n, attr = elem.attributes, p = { p:"range", series:[0], divs:5, orient:0, format:intf };

	if ((p.index = this.getChartPartCount("range", parts)) > 1) {
		this.log("<di_chart_range> appears more than twice.");
		return;
	}

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "caption":
				p.caption = this.translate(attr[n].value);
				break;
			case "orient":
				p.orient = this.cvtEnum("orient", attr[n].value, this.validOrient, true);
				break;
			case "series":
				p.series = this.makeIntArray("series", attr[n].value);
				break;
			case "divs":
				p.divs = this.cvtNum("divs", true, attr[n].value, 2, 21);
				break;
			case "format":
				p.format = this.getFormat(this.cvtEnum("format", attr[n].value, this.validFormat));
				break;
			case "lowmargin":
				p.lowmargin = this.cvtNum("lowmargin", false, attr[n].value, 0, 1);
				break;
			case "highmargin":
				p.highmargin = this.cvtNum("highmargin", false, attr[n].value, 0, 1);
				break;
			case "fixedlow":
				p.fixedlow = this.cvtNum("fixedlow", false, attr[n].value);
				break;
			case "fixedhigh":
				p.fixedhigh = this.cvtNum("fixedhigh", false, attr[n].value);
				break;
			case "labeloffset":
				p.labeloffset = this.cvtNum("labeloffset", true, attr[n].value, -99, 99);
				break;
			case "labelangle":
				p.labelangle = this.cvtNum("labelangle", true, attr[n].value, 0, 90);
				break;
			default:
				this.log("Unknown <di_chart_range> attribute '" + attr[n].nodeName + "'.")
		}

	if (elem.children.length)
		this.log("<di_chart_range> contains unknown child tags.");

	parts.push(p);
};

API.prototype.tagDashChartMargin = function (elem, parts) {
	var n, attr = elem.attributes, p = { p:"margin", left:80, top:50, right:20, bottom:60 };

	if (this.getChartPartCount("margin", parts)) {
		this.log("<di_chart_margin> appears more than once.");
		return;
	}

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "left":
				p.left = this.cvtNum("left", true, attr[n].value, 0, 199);
				break;
			case "top":
				p.top = this.cvtNum("top", true, attr[n].value, 0, 199);
				break;
			case "right":
				p.right = this.cvtNum("right", true, attr[n].value, 0, 199);
				break;
			case "bottom":
				p.bottom = this.cvtNum("bottom", true, attr[n].value, 0, 199);
				break;
			default:
				this.log("Unknown <di_chart_margin> attribute '" + attr[n].nodeName + "'.")
		}

	if (elem.children.length)
		this.log("<di_chart_margin> contains unknown child tags.");

	parts.push(p);
};

API.prototype.tagDashChartGrid = function (elem, parts) {
	var n, attr = elem.attributes, p = { p:"grid", horz:true, vert:true, border:true };

	if (this.getChartPartCount("grid", parts)) {
		this.log("<di_chart_grid> appears more than once.");
		return;
	}

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "horz":
				p.horz = this.cvtBool("horz", attr[n].value);
				break;
			case "vert":
				p.vert = this.cvtBool("vert", attr[n].value);
				break;
			case "border":
				p.border = this.cvtBool("border", attr[n].value);
				break;
			default:
				this.log("Unknown <di_chart_grid> attribute '" + attr[n].nodeName + "'.")
		}

	if (elem.children.length)
		this.log("<di_chart_grid> contains unknown child tags.");

	parts.push(p);
};

API.prototype.tagDashChartPopup = function (elem, parts) {
	var n, attr = elem.attributes, p = { p:"popup" };

	if (this.getChartPartCount("popup", parts)) {
		this.log("<di_chart_popup> appears more than once.");
		return;
	}

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "width":
				p.width = this.cvtNum("width", true, attr[n].value, 1, 9999);
				break;
			case "height":
				p.height = this.cvtNum("height", true, attr[n].value, 1, 9999);
				break;
			case "text":
				p.text = this.translate(attr[n].value);
				break;
			default:
				this.log("Unknown <di_chart_popup> attribute '" + attr[n].nodeName + "'.")
		}

	if (!p.width || !p.height || !p.text)
		this.log("<di_chart> attributes 'width', 'height' and 'text' are required.");
	else if (elem.children.length)
		this.log("<di_chart_popup> contains unknown child tags.");

	parts.push(p);
};

API.prototype.tagDashChart = function (elem, controls) {
	var n, attr = elem.attributes, ctrl = { p:"chart", parts:[] };

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "tabcaption":
				ctrl.tabCaption = this.translate(attr[n].value);
				break;
			case "pos":
				ctrl.pos = attr[n].value;
				break;
			case "caption":
				ctrl.caption = this.translate(attr[n].value);
				break;
			case "query":
				ctrl.qid = attr[n].value.toLowerCase();
				break;
			case "columns":
				ctrl.columns = this.cvtNum("columns", true, attr[n].value, 0, 99);
				break;
			case "horz":
				ctrl.horz = this.cvtBool("horz", attr[n].value);
				break;
			case "origin":
				ctrl.origin = this.cvtNum("origin", false, attr[n].value);
				break;
			case "coloffset":
				ctrl.colOffset = this.cvtNum("coloffset", true, attr[n].value, 0);
				break;
			case "fixed":
				ctrl.fixed = this.cvtNum("fixed", true, attr[n].value, 0);
				break;
			default:
				this.log("Unknown <di_chart> attribute '" + attr[n].nodeName + "'.")
		}

	if (!ctrl.tabCaption || !ctrl.pos || !ctrl.caption || ctrl.columns === undefined)
		this.log("<di_chart> attributes 'tabCaption', 'pos', 'caption' and 'columns' are required.");
	else
		this.parseChildren(elem, function (c) {
			switch (c.nodeName) {
				case "DI_CHART_GRID":
					this.tagDashChartGrid(c, ctrl.parts);
					break;
				case "DI_CHART_MARGIN":
					this.tagDashChartMargin(c, ctrl.parts);
					break;
				case "DI_CHART_RANGE":
					this.tagDashChartRange(c, ctrl.parts);
					break;
				case "DI_CHART_SERIES":
					this.tagDashChartSeries(c, ctrl.parts);
					break;
				case "DI_CHART_BAR":
					this.tagDashChartBar(c, ctrl.parts);
					break;
				case "DI_CHART_LINE":
					this.tagDashChartLine(c, ctrl.parts);
					break;
				case "DI_CHART_SHAPE":
					this.tagDashChartShape(c, ctrl.parts);
					break;
				case "DI_CHART_HEADER":
					this.tagDashChartHeader(c, ctrl.parts);
					break;
				case "DI_CHART_POPUP":
					this.tagDashChartPopup(c, ctrl.parts);
					break;
				default:
					this.log("Unknown chart tag <" + c.nodeName.toLowerCase() + ">.")
			}
		});

	controls.push(ctrl);
};

API.prototype.validJust = ["start", "middle", "end"];

API.prototype.tagDashDivPos = function (elem, divpos) {
	var n, attr = elem.attributes, d = { };

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "pos":
				d.pos = attr[n].value;
				break;
			case "n":
				d.n = this.cvtNum("n", true, attr[n].value, 0, 99);
				break;
			case "pct":
				d.pct = this.cvtNum("pct", false, attr[n].value, 0, 100);
				break;
			default:
				this.log("Unknown <di_div_adj> attribute '" + attr[n].nodeName + "'.")
		}

	if (!d.pos || d.n == undefined || d.pct == undefined)
		this.log("<di_div_pos> attributes 'pos','n' and 'pct' are required.");
	else {
		if (elem.children.length)
			this.log("<di_div_pos> contains unknown child tags.");
		divpos.push(d);
	}
};

API.prototype.tagDashInfo = function (elem, infos, type) {
	var n, attr = elem.attributes, i = { };

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "text":
				i.text = this.translate(attr[n].value);
				break;
			case "just":
				i.just = this.cvtEnum("just", attr[n].value, this.validJust);
				break;
			case "query":
				i.qid = attr[n].value.toLowerCase();
				break;
			case "legend":
				i.legend = attr[n].value.toLowerCase();
				break;
			default:
				this.log("Unknown <di_" + type + "> attribute '" + attr[n].nodeName + "'.")
		}

	if (!i.text)
		this.log("<di_" + type + "> attribute 'text' is required.");
	else {
		if (elem.children.length)
			this.log("<di_" + type + "> contains unknown child tags.");
		infos.push(i);
	}
};

API.prototype.tagDashDrawerFilter = function (elem, controls) {
	var n, attr = elem.attributes, f = { e:"filter", controls:[] };

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "name":
				f.name = attr[n].value;
				break;
			case "mode":
				f.mode = this.cvtNum("mode", true, attr[n].value, 0, 99);
				break;
			default:
				this.log("Unknown <di_drawer_filter> attribute '" + attr[n].nodeName + "'.")
		}

	if (!f.name)
		this.log("<di_drawer_filter> attribute 'name' required.");
	else {
		this.parseDrawerControls(elem, f.controls, true);
		controls.push(f);
	}
};

API.prototype.tagDashDrawerSubpanel = function (elem, subpanels, isDim) {
	var n, attr = elem.attributes, p = { controls:[] };

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "caption":
				p.name = this.translate(attr[n].value);
				break;
			case "cond":
				p.cond = attr[n].value;
				break;
			default:
				this.log("Unknown <di_drawer_subpanel> attribute '" + attr[n].nodeName + "'.")
		}

	if (!p.name)
		this.log("<di_drawer_subpanel> attribute 'caption' is required.");
	else {
		this.parseDrawerControls(elem, p.controls, isDim);
		subpanels.push(p);
	}
};

API.prototype.tagDashDrawerChooser = function (elem, controls, isDim) {
	var n, attr = elem.attributes, ch = { e:"chooser", subpanels:[] };

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "caption":
				ch.heading = this.translate(attr[n].value);
				break;
			case "horz":
				ch.horz = this.cvtBool("horz", attr[n].value);
				break;
			case "height":
				ch.height = parseInt(attr[n].value);
				break;
			default:
				this.log("Unknown <di_drawer_chooser> attribute '" + attr[n].nodeName + "'.")
		}

	if (ch.horz && ch.height)
		this.log("<di_drawer_chooser> attribute 'height' ignored on horizontal orientation.");

	this.parseChildren(elem, function (c, isDim) {
		switch (c.nodeName) {
			case "DI_DRAWER_SUBPANEL":
				this.tagDashDrawerSubpanel(c, ch.subpanels, isDim);
				break;
			default:
				this.log("Unknown chooser tag <" + c.nodeName.toLowerCase() + ">.")
		}
	}, isDim);

	controls.push(ch);
};

API.prototype.tagDashDrawerDim = function (elem, controls) {
	var n, attr = elem.attributes, d = { e:"dim" };

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "name":
				d.name = attr[n].value;
				break;
			case "height":
				d.height = this.cvtNum("height", true, attr[n].value, 20);
				break;
			case "columns":
				d.columns = this.cvtNum("columns", true, attr[n].value, 1, 2);
				break;
			case "mode":
				d.mode = this.cvtNum("mode", true, attr[n].value, 0, 99);
				break;
			default:
				this.log("Unknown <di_drawer_dim> attribute '" + attr[n].nodeName + "'.")
		}

	if (!d.name)
		this.log("<di_drawer_dim> attribute 'name' required.");
	else {
		if (elem.children.length)
			this.log("<di_drawer_dim> contains unknown child tags.");
		controls.push(d);
	}
};

API.prototype.tagDashDrawerText = function (elem, controls) {
	var n, attr = elem.attributes, c = { e:"text" };

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "text":
				c.text = this.translate(attr[n].value);
				break;
			case "height":
				c.height = this.cvtNum("height", true, attr[n].value, 20);
				break;
			default:
				this.log("Unknown <di_drawer_text> attribute '" + attr[n].nodeName + "'.")
		}

	if (!c.text)
		this.log("<di_drawer_text> attribute 'text' is required.");
	else {
		if (elem.children.length)
			this.log("<di_drawer_text> contains unknown child tags.");
		controls.push(c);
	}
};

API.prototype.parseDrawerControls = function (elem, controls, isDim) {
	this.parseChildren(elem, function (c, isDim) {
		switch (c.nodeName) {
			case "DI_DRAWER_TEXT":
				this.tagDashDrawerText(c, controls);
				break;
			case "DI_DRAWER_DIM":
				if (isDim)
					this.tagDashDrawerDim(c, controls);
				else
					this.log("<di_drawer_dim> is not a descendant of <di_drawer_filter>.");
				break;
			case "DI_DRAWER_CHOOSER":
				this.tagDashDrawerChooser(c, controls, isDim);
				break;
			case "DI_DRAWER_FILTER":
				this.tagDashDrawerFilter(c, controls);
				break;
			default:
				this.log("Unknown drawer tag <" + c.nodeName.toLowerCase() + ">.")
		}
	}, isDim);
};

API.prototype.tagDashDrawerPanel = function (elem, panels) {
	var n, attr = elem.attributes, p = { mode:1, controls:[] };

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "caption":
				p.caption = this.translate(attr[n].value);
				break;
			case "mode":
				p.mode = this.cvtNum("mode", true, attr[n].value, 0, 99);
				break;
			default:
				this.log("Unknown <di_drawer_panel> attribute '" + attr[n].nodeName + "'.")
		}

	this.parseDrawerControls(elem, p.controls);
	panels.push(p);
};

API.prototype.validAxis = ["with", "columns", "rows", "where", "custom"];

API.prototype.tagDashQueryOp = function (parent, elem, ops, type) {
	var n, attr = elem.attributes, q = { c:type };

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "source":
				q.source = attr[n].value.toLowerCase();
				break;
			case "columns":
				q.cols = this.makeIntArray("cols", attr[n].value);
				break;
			case "rows":
				q.rows = this.makeIntArray("rows", attr[n].value);
				break;
			case "descend":
				q.descend = this.cvtBool("descend", attr[n].value);
				break;
			default:
				this.log("Unknown <di_query_" + type.toLowerCase() + "> attribute '" + attr[n].nodeName + "'.");
		}

	ops.push(q);
};

API.prototype.tagDashQueryFilter = function (elem, filters) {
	var n, attr = elem.attributes, f = {};

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "name":
				f.name = attr[n].value;
				break;
			case "axis":
				f.axis = this.cvtEnum("axis", attr[n].value, this.validAxis);
				break;
			case "dim":
				f.dim = attr[n].value;
				break;
			case "attrs":
				f.attrs = this.makeIntArray("attrs", attr[n].value);
				break;
			default:
				this.log("Unknown <di_query_filter> attribute '" + attr[n].nodeName + "'.")
		}

	if (!f.name || !f.axis)
		this.log("<di_query_filter> attributes 'name' and 'axis' are required.");
	else
		filters.push(f);
};

API.prototype.tagDashQuery = function (elem, queries) {
	var n, attr = elem.attributes, q = { filters:[], qops:[] };

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "id":
				q.id = attr[n].value.toLowerCase();
				break;
			case "endpoint":
				q.endpoint = attr[n].value;
				break;
			default:
				this.log("Unknown <di_query> attribute '" + attr[n].nodeName + "'.")
		}

	if (!q.id)
		this.log("<di_query> attribute 'id' is required.");
	else if (this.isDupe(queries, q.id))
		this.log("Duplicate <di_query> id '" + q.id + "'.");
	else {
		this.parseChildren(elem, function (c) {
			switch (c.nodeName) {
				case "DI_QUERY_FILTER":
					this.tagDashQueryFilter(c, q.filters);
					break;
				case "DI_QUERY_COPY_COLUMNS":
					this.tagDashQueryOp(elem, c, q.qops, "copy_columns");
					break;
				case "DI_QUERY_COPY_ROWS":
					this.tagDashQueryOp(elem, c, q.qops, "copy_rows");
					break;
				case "DI_QUERY_REORDER_COLUMNS":
					this.tagDashQueryOp(elem, c, q.qops, "reorder_columns");
					break;
				case "DI_QUERY_REORDER_ROWS":
					this.tagDashQueryOp(elem, c, q.qops, "reorder_rows");
					break;
				case "DI_QUERY_TRANSPOSE_COLUMNS":
					this.tagDashQueryOp(elem, c, q.qops, "transpose_columns");
					break;
				case "DI_QUERY_TRANSPOSE_ROWS":
					this.tagDashQueryOp(elem, c, q.qops, "transpose_rows");
					break;
				case "DI_QUERY_SORT_ROWS":
					this.tagDashQueryOp(elem, c, q.qops, "sort_rows");
					break;
				default:
					this.log("Unknown query tag <" + c.nodeName.toLowerCase() + ">.")
			}
		});
		queries.push(q);
	}
};

API.prototype.tagDashFilterDefault = function (elem, defaults) {
	var n, attr = elem.attributes, d = {};

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "active":
				d.active = attr[n].value;
				break;
			case "state":
				d.state = this.cvtNum("state", true, attr[n].value, 0, 1);
				break;
			case "attrs":
				d.attrs = this.makeIntArray("attrs", attr[n].value);
				break;
			default:
				this.log("Unknown <di_filter_default> attribute '" + attr[n].nodeName + "'.")
		}

	if (d.active == undefined || d.state == undefined || d.attrs == undefined)
		this.log("<di_filter_default> attributes 'active','state' and 'attrs' are required.");
	else
		defaults.push(d);
};

API.prototype.tagDashFilter = function (elem, filters) {
	var n, attr = elem.attributes, f = { defaults:[], dims:["*", "*"], show:"yes" };

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "name":
				f.name = attr[n].value.toLowerCase();
				break;
			case "dims":
				f.dims = attr[n].value.split(",");
				break;
			case "show":
				f.show = this.cvtBool("show", attr[n].value);
				break;
			default:
				this.log("Unknown <di_filter> attribute '" + attr[n].nodeName + "'.")
		}

	if (!f.name)
		this.log("<di_filter> attribute 'name' is required.");
	else {
		this.parseChildren(elem, function (c) {
			switch (c.nodeName) {
				case "DI_FILTER_DEFAULT":
					this.tagDashFilterDefault(c, f.defaults);
					break;
				default:
					this.log("Unknown filter tag <" + c.nodeName.toLowerCase() + ">.")
			}
		});
		if (!f.defaults.length)
			this.log("<di_filter> requires <di_filter_default> child tag.");
		filters.push(f);
	}
};

API.prototype.tagDashTab = function (elem, tabs) {
	var n, attr = elem.attributes, t = { controls:[], qid:"", colOffset:0 };

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "caption":
				t.caption = this.translate(attr[n].value);
				break;
			case "query":
				t.qid = attr[n].value.toLowerCase();
				break;
			case "coloffset":
				t.colOffset = this.cvtNum("coloffset", true, attr[n].value, 0);
				break;
			default:
				this.log("Unknown <di_tab> attribute '" + attr[n].nodeName + "'.")
		}

	if (!t.caption)
		this.log("<di_tab> attribute 'caption' is required.");
	else {
		this.parseChildren(elem, function (c) {
			switch (c.nodeName) {
				case "DI_CHART":
					this.tagDashChart(c, t.controls);
					break;
				case "DI_TABLE":
					this.tagDashTable(c, t.controls);
					break;
				case "DI_NUMBERS":
					this.tagDashNumbers(c, t.controls);
					break;
				case "DI_DIALS":
					this.tagDashDials(c, t.controls);
					break;
				default:
					this.log("Unknown query tag <" + c.nodeName.toLowerCase() + ">.")
			}
		});
		tabs.push(t);
	}
};

API.prototype.tagDashGblMap = function (elem, widgets) {
	var n, attr = elem.attributes, w = { w:"gblmap" };

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			default:
				this.log("Unknown <di_widget_global_map> (gblmap) attribute '" + attr[n].nodeName + "'.")
		}

	if (elem.children.length)
		this.log("<di_widget_global_map> contains unknown child tags.");

	widgets.push(w);
};

API.prototype.tagDashWidgets = function (elem, widgets) {
	this.parseChildren(elem, function (c) {
		switch (c.nodeName) {
			case "DI_WIDGET_GLOBAL_MAP":
				this.tagDashGblMap(c, widgets);
				break;
			default:
				this.log("Unknown widget tag <" + c.nodeName.toLowerCase() + ">.")
		}
	});
};

API.prototype.tagDash = function (elem, config) {
	var n, c;

	for (n = 0, c = elem.children; n < c.length; n++)
		switch (c[n].nodeName) {
			case "DI_WIDGETS":
				this.tagDashWidgets(c[n], config.widgets);
				break;
			case "DI_HEADER":
				this.tagDashInfo(c[n], config.headers, "header");
				break;
			case "DI_FOOTER":
				this.tagDashInfo(c[n], config.footers, "footer");
				break;
			case "DI_DRAWER_PANEL":
				this.tagDashDrawerPanel(c[n], config.drawerPanels);
				break;
			case "DI_FILTER":
				this.tagDashFilter(c[n], config.filters);
				break;
			case "DI_QUERY":
				this.tagDashQuery(c[n], config.queries);
				break;
			case "DI_TAB":
				this.tagDashTab(c[n], config.tabs);
				break;
			case "DI_OPTIONS":
				this.tagDashOptions(c[n], config.options);
				break;
			case "DI_DIV_POS":
				this.tagDashDivPos(c[n], config.divpos);
				break;
			case "DI_SNIPPET":
				break;
			default:
				this.log("Unknown dashboard tag <" + c[n].nodeName.toLowerCase() + ">.")
		}
};

API.prototype.loadDashboard = function (form, ri, di, cbdata, client, func) {
	var r = reports[ri], d = r.dashboards[di], me = this, endpoint;

	if (d.endpoint)
		endpoint = d.endpoint;
	else if (r.endpoint)
		endpoint = r.endpoint;

	$("di_active_report").load(r.id + ".htm", undefined, function (rt, ts) {
		if (ts == "success")
			$("di_active_dashboard").load(d.id + ".htm", undefined, function (rt, ts) {
				if (ts == "success") {
					var config = { endpoint:endpoint, headers:[], footers:[],
						drawerPanels:[], filters:[], queries:[], tabs:[], widgets:[],
						options:{ tabWidth:50, minWidth:900, minHeight:500 }, divpos:[] };
					me.tagDash($("di_active_dashboard")[0], config);
					func.call(client, new Dashboard(form, config), cbdata, d.id);
				}
				else
					me.log("Dashboard '" + d.id + ".htm" + "' not found.");
			});
		else
			me.log("Report '" + r.id + ".htm" + "' not found.");
	});
};

API.prototype.tagToolDashboard = function (elem, report) {
	var n, attr = elem.attributes, d = {}, item;

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "name":
				item = this.translate(attr[n].value);
				d.id = attr[n].value;
				break;
			case "endpoint":
				d.endpoint = attr[n].value;
				break;
			default:
				this.log("Unknown <di_dashboard> attribute '" + attr[n].nodeName + "'.")
		}

	if (!item)
		this.log("<di_dashboard> attribute 'name' is required.");
	else if (this.isDupe(report.dashboards, d.id))
		this.log("Duplicate <di_dashboard> id '" + d.id + "'.");
	else {
		report.items.push(item);
		report.dashboards.push(d);
	}
};

/**
    elem: a <di_report> element.
    
*/
API.prototype.tagToolReport = function (elem) {
	var n, c, report = { items:[], dashboards:[] }, attr = elem.attributes, name;

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "name":
				report.id = attr[n].value.toLowerCase();
				report.text = this.translate(attr[n].value);
				report.image = "media/" + attr[n].value + ".png";
				break;
			case "endpoint":
				report.endpoint = attr[n].value;
				break;
			default:
				this.log("Unknown <di_report> attribute '" + attr[n].nodeName + "'.")
		}

	if (!report.id || !report.endpoint)
		this.log("<di_report> attributes 'name' and 'endpoint' are required.");
	else if (this.isDupe(reports, report.id))
		this.log("Duplicate <di_report> id '" + report.id + "'.");
	else {
		for (n = 0, c = elem.children; n < c.length; n++)
			switch (c[n].nodeName) {
				case "DI_DASHBOARD":
					this.tagToolDashboard(c[n], report);
					break;
				default:
					this.log("Unknown report tag <" + c[n].nodeName.toLowerCase() + ">.")
			}
		if (!report.dashboards.length)
			this.log("Report '" + report.text + "' has no dashboards.");
		reports.push(report);
	}
};

/**
    * Set Metadata.prototype.trace and Query.prototype.trace based on attributes of <di_tool>
    * Call tagToolReport() on the <di_report> child of <di_tool>
*/
API.prototype.tagTool = function () {
	var tool = $("di_tool");
	var elem = tool[0];
	var attr = elem.attributes;
	var n, c;

	if (tool.length > 1)
		this.log("Multiple <di_tool> definitions.");
	else {
		for (n = 0; n < attr.length; n++)
			switch (attr[n].nodeName) {
				case "showmetadata":
					MetaData.prototype.trace = this.cvtBool("showmetadata", attr[n].value);
					break;
				case "showquery":
					Query.prototype.trace = this.cvtBool("showquery", attr[n].value);
					break;
				default:
					this.log("Unknown <di_report> attribute '" + attr[n].nodeName + "'.")
			}

		document.body.appendChild(document.createElement("di_active_report"));
		document.body.appendChild(document.createElement("di_active_dashboard"));

		for (n = 0, c = elem.children; n < c.length; n++)
			switch (c[n].nodeName) {
				case "DI_REPORT":
					this.tagToolReport(c[n]);
					break;
				default:
					this.log("Unknown tool tag <" + c[n].nodeName.toLowerCase() + ">.")
			}
	}
};

/**
    Read info from a <di_text> element, and set the appropriate value in the
    global 'ltrans' object.
*/
API.prototype.tagLangText = function (elem) {
	var n, attr = elem.attributes, text, trans;

	for (n = 0; n < attr.length; n++)
		switch (attr[n].nodeName) {
			case "text":
				text = attr[n].value;
				break;
			case "trans":
				trans = attr[n].value;
				break;
			default:
				this.log("Unknown <di_text> attribute '" + attr[n].nodeName + "'.")
		}

	if (ltrans[text])
		this.log("Duplicate <di_text> definition '" + text + "'.");
	else
		ltrans[text] = trans;
};

/**
    Call tagLangText() (above) on each <di_text> child element of <di_lang>
*/
API.prototype.tagLang = function () {
	var lang = $("di_lang");
	var elem = lang[0];
	var n, c;

	if (lang.length > 1)
		this.log("Multiple <di_lang> definitions.");

	for (n = 0, c = elem.children; n < c.length; n++)
		switch (c[n].nodeName) {
			case "DI_TEXT":
				this.tagLangText(c[n]);
				break;
			default:
				this.log("Unknown language tag <" + c[n].nodeName.toLowerCase() + ">.")
		}
};

/**
    DITool's version of document.onload()
*/
API.prototype.onLoad = function () {

    // Ensure we use the https protocol
	if (window.location.protocol.toLowerCase() != "https:")
		window.location = "https://" + window.location.host + "/" + window.location.search;

    // Set language for localization
    // * Create and attaches the <di_lang> element
	var di_lang = document.createElement("di_lang"), me = this;
	document.body.appendChild(di_lang);
    
    // Load some appropriate language file
	$("di_lang").load(lang + ".htm", undefined, function (rt, ts) {
		if (ts == "success")
			me.tagLang();
		else
			me.log("Language '" + lang + "' not found.");

		me.tagTool();

		new Main();
	});
};

/**
    Outputs the ditool <head> and <body> elements.
*/
API.prototype.createHeader = function () {
	document.writeln("<head>");

	document.writeln("<title>STR Data Intelligence</title>");

	document.writeln("<style type='text/css'> html { background: #000;" +
		" overflow: hidden; margin: 0; padding: 0; border: 0; cursor: default } </style>");

	document.writeln("<link rel='stylesheet' type='text/css' href='ditool/ditool.css' />");

	if (!this.publish) {
		document.writeln("<script type='text/javascript' src='ditool/raphael.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/jquery.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/date.js'></script>");

		document.writeln("<script type='text/javascript' src='ditool/metadata.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/procdates.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/reportsubs.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/filter.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/query.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/queryops.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/reader.js'></script>");

		document.writeln("<script type='text/javascript' src='ditool/controls.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/language.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/control.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/text.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/slideshow.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/symbolbutton.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/inputfield.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/arranger.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/multitab.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/panelwithdrawer.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/chooser.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/changeindicator.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/controlarray.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/iconarray.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/buttonarray.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/popup.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/iconmenu.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/menu.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/chart.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/fanchart.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/piechart.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/dials.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/numbers.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/table.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/explorer.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/controlpanel.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/globalmap.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/login.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/form.js'></script>");

		document.writeln("<script type='text/javascript' src='ditool/language.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/common.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/theme.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/attrs.js'></script>");
		document.writeln("<script type='text/javascript' src='ditool/dashboard.js'></script>");

		document.writeln("<script type='text/javascript' src='ditool/main.js'></script>");
	}

	document.writeln("</head>");

	document.writeln("<body scroll='no' onload='api.onLoad()'></body>");

};

api = new API(false);
