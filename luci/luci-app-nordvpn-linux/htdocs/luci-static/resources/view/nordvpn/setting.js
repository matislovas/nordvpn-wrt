/* SPDX-License-Identifier: GPL-3.0-or-later
 *
 * Copyright (C) 2024 NordSecurity
 */

'use strict';
'require form';
'require fs';
'require poll';
'require rpc';
'require uci';
'require view';


var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: ['name'],
	expect: { '': {} }
});

function parseStdoutToJSON(stdout) {
	const lines = stdout.split('\n');
	const jsonData = {};
	for (const line of lines) {
		if (line.length > 0) {
			const [key, value] = line.split(': ');
			if (typeof key !== 'undefined' && typeof value !== 'undefined') {
				jsonData[key.trim()] = value.trim();
			}
		}
	}
	return jsonData;
}

function getStatus() {
	var status = {};
	return Promise.resolve(callServiceList('nordvpn')).then(function (res) {
		try {
			status.isRunning = res['nordvpn']['instances']['instance1']['running'];
		} catch (e) {
			status.isRunning = false;
		}
		return Promise.all([fs.exec("/usr/bin/nordvpn", ["status"]), fs.exec("/usr/bin/nordvpn", ["account"])]);
	}).then(function(data) {
		var res_status = data[0];
		var res_acc = data[1];

		if (res_status.code !== 0 || res_acc.code !== 0) {
			status.Connected = undefined;
			status.LoginStatus = undefined;
			return status;
		}

		var nordvpnStatus = parseStdoutToJSON(res_status.stdout);

		var loginStatus = { loggedIn: true };
		if (res_acc.stdout.includes("You are not logged in.")) {
			loginStatus.loggedIn = false;
		} else {
			var accStatusParsed = parseStdoutToJSON(res_acc.stdout);
			loginStatus.email = accStatusParsed['Email Address'];
			loginStatus.vpnService = accStatusParsed['VPN Service'];
			loginStatus.dedicatedIp = accStatusParsed['Dedicated IP'];
		}
		status.LoginStatus = loginStatus;

		if (nordvpnStatus.Status != "Disconnected") {
			status.Connected = true;
			status.Server = nordvpnStatus['Server'];
			status.Hostname = nordvpnStatus['Hostname'];
			status.Ip = nordvpnStatus['IP'];
			status.Country = nordvpnStatus['Country'];
			status.City = nordvpnStatus['City'];
			status.CurrentTechnology = nordvpnStatus['Current technology'];
			status.CurrentProtocol = nordvpnStatus['Current protocol'];
			status.Transfer = nordvpnStatus['Transfer'];
			status.Uptime = nordvpnStatus['Uptime'];
		} else {
			status.Connected = false;
		}

		return status;
	}).catch(function(error) {
		status.Connected = undefined;
		status.LoginStatus = undefined;
		return status;
	});
}

function getCountries() {
	var countries = [];
	return Promise.resolve(callServiceList('nordvpn')).then(function (res) {
		return fs.exec("/usr/bin/nordvpn", ["countries"]);
	}).then(function(res) {
		if (res.code == 0) {
			var res = res.stdout + '';
			const lines = res.split(', '); 
			for (const line of lines) {
				const row = line.trim().split('\t');
				countries.push(row);
			}
		}
		return countries;
	});
}

function renderServiceStatus(status) {
	var spanTemp = '<em><span style="color:%s"><strong>%s %s</strong></span></em>';
	var renderHTML = '';
	if (!status.isRunning) {
		renderHTML = String.format(spanTemp, 'grey', _('NordVPN'), _('is not running'));
	} else if (typeof status.LoginStatus !== 'undefined' && status.LoginStatus.loggedIn == true) {
		if (typeof status.Connected !== 'undefined' && status.Connected == true) {
			renderHTML = String.format(spanTemp, 'green', _('NordVPN'), _('logged in and connected'));
		} else {
			renderHTML = String.format(spanTemp, 'yellow', _('NordVPN'), _('logged in and disconnected'));
		}
	} else {
		renderHTML = String.format(spanTemp, 'red', _('NordVPN'), _('logged out and disconnected'));
	}
	return renderHTML;
}

function renderAccountStatus(status) {
	var spanTemp = '<em><span style="font-weight:bold">Account Information:</span></em><br>Email Address: %s<br>VPN Service: %s<br>Dedicated IP: %s';
	var renderHTML = '';
	if (typeof status.LoginStatus !== 'undefined' && status.LoginStatus.loggedIn == true) {
		renderHTML = String.format(spanTemp, status.LoginStatus.email, status.LoginStatus.vpnService, status.LoginStatus.dedicatedIp);
	}
	return renderHTML;
}

function renderVpnStatus(status) {
	var spanTemp = '<em><span style="font-weight:bold">VPN Information:</span></em><br>Server: %s<br>Hostname: %s<br>IP: %s<br>Country: %s<br>City: %s<br>Uptime: %s';
	var renderHTML = '';
	if (typeof status.Connected !== 'undefined' && status.Connected == true) {
		renderHTML = String.format(spanTemp, status.Server, status.Hostname, status.Ip, status.Country, status.City, status.Uptime);
	}
	return renderHTML;
}

return view.extend({
	load: function() {
		return Promise.all([
			uci.load('nordvpn'),
			getCountries(),
		]);
	},

	render: function(data) {
		var m, s, o;
		var countries = data[1];

		m = new form.Map('nordvpn', _('NordVPN'), _('NordVPN is best online VPN service for speed and security.'));

		s = m.section(form.TypedSection);
		s.anonymous = true;
		s.render = function () {
			poll.add(function() {
				return Promise.resolve(getStatus()).then(function(res) {
					var service_view = document.getElementById("service_status");
					var account_view = document.getElementById("account_status");
					var vpn_view = document.getElementById("vpn_status");
					
					service_view.innerHTML = renderServiceStatus(res);	
					account_view.innerHTML = renderAccountStatus(res);
					vpn_view.innerHTML = renderVpnStatus(res);
				});
			});
	
			return E('div', { class: 'cbi-section', id: 'status_bar' }, [
					E('p', { id: 'service_status' }, _('Collecting data ...')),
					E('p', { id: 'account_status' }, _('')),
					E('p', { id: 'vpn_status' }, _('')),
			]);
		}

		s = m.section(form.NamedSection, 'settings', 'config');
		s.tab('basic',_('Basic Settings'));

		o = s.taboption('basic',form.Flag, 'enabled', _('Enable'));
		o.default = o.disabled;
		o.rmempty = false;

		o = s.taboption('basic',form.Value, 'token', _('Token'), _('Access token for NordVPN.'));
		o.default = '';
		o.rmempty = false;
		o.password = true;

		o = s.taboption('basic',form.Flag, 'vpn', _('VPN'), _('Enable VPN connection.'));
		o.default = o.disabled;
		o.rmempty = false;

		o = s.taboption('basic',form.Flag, 'meshnet', _('Meshnet'), _('Enable meshnet.'));
		o.default = o.enabled;
		o.rmempty = false;

		o = s.taboption('basic',form.Flag, 'ipv6', _('IPv6'), _('Enable ipv6 networking.'));
		o.default = o.enabled;
		o.rmempty = false;

		if (countries.length > 0) {
			o = s.taboption('basic',form.ListValue, 'country', _('Country'), _('Country to connect VPN to'));
			o.depends('vpn', '1');
			for (const country of countries) {
				o.value(country, country);
			}
			o.default = countries[0];
			o.rmempty = true;
		}

		o = s.taboption('basic',form.ListValue, 'protocol', _('OpenVPN protocol'));
		o.value('TCP', 'TCP');
		o.value('UDP', 'UDP');
		o.depends('technology', 'OPENVPN');
		o.default = 'UDP';
		o.rmempty = true;

		o = s.taboption('basic',form.ListValue, 'technology', _('Technology for VPN connection'));
		o.value('OPENVPN', 'OpenVPN');
		o.value('NORDLYNX', 'NordLynx');
		o.default = 'NORDLYNX';
		o.rmempty = false;

		o = s.taboption('basic',form.Flag, 'log_stdout', _('StdOut Log'), _('Logging program activities.'));
		o.default = o.enabled;
		o.rmempty = false;

		o = s.taboption('basic',form.Flag, 'log_stderr', _('StdErr Log'), _('Logging program errors and exceptions.'));
		o.default = o.enabled;
		o.rmempty = false;

		return m.render();
	}
});
