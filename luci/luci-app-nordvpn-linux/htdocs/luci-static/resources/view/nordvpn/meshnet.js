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
'require ui';
'require view';


var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: ['name'],
	expect: { '': {} }
});

function getMeshPeerList() {
	var meshPeers = { thisDevice: undefined, localPeers: [], externalPeers: [] };

	return Promise.resolve(callServiceList('nordvpn')).then(function (res) {
		return fs.exec("/usr/bin/nordvpn", ["mesh", "peer", "list"]);
	}).then(function(res) {
		if (res.code == 0) {
			var inputString = res.stdout;
			const lines = inputString.split('\n');
			const meshPeers = {
				thisDevice: {},
				localPeers: [],
				externalPeers: []
			};
			
			let currentSection = '';
			let currentPeer = {};
			
			function addPeerToSection() {
				if (Object.keys(currentPeer).length > 0) {
					if (currentSection === 'Local Peers:') {
						meshPeers.localPeers.push(currentPeer);
					} else if (currentSection === 'External Peers:') {
						meshPeers.externalPeers.push(currentPeer);
					}

					currentPeer = {};
				}
			}
			
			for (const line of lines) {
				if (line.trim() === '') 
					continue;
			
				if (line.endsWith(':')) {
					addPeerToSection();
					currentSection = line.trim();
					continue;
				}
			
				const [key, value] = line.split(':').map(part => part.trim());
				
				if (currentSection === 'This device:') {
					meshPeers.thisDevice[key] = value;
				} else {
					if (key === 'Hostname' && Object.keys(currentPeer).length > 0) {
						addPeerToSection();
					}
					
					const formattedKey = key.replace(/ /g, '');
					currentPeer[formattedKey] = value;
				}
			}
			
			addPeerToSection();
			
			return meshPeers;
		}
	});
}

function convertPeersToArrays(peers) {
	const orderOfKeys = [
	  'Hostname',
	  'Nickname',
	  'Status',
	  'IP',
	  'PublicKey',
	  'OS',
	  'Distribution',
	  'AllowIncomingTraffic',
	  'AllowRouting',
	  'AllowLocalNetworkAccess',
	  'AllowSendingFiles',
	  'AllowsIncomingTraffic',
	  'AllowsRouting',
	  'AllowsLocalNetworkAccess',
	  'AllowsSendingFiles',
	  'AcceptFileshareAutomatically'
	];
  
	return peers.map(peer => {
	  return orderOfKeys.map(key => peer[key] || '');
	});
}

function convertDevToArray(peers) {
	const orderOfKeys = [
	  'Hostname',
	  'Nickname',
	  'IP',
	  'Public Key',
	  'OS',
	  'Distribution',
	];
  
	return peers.map(peer => {
	  return orderOfKeys.map(key => peer[key] || '');
	});
}

return view.extend({
	load: function() {
        return Promise.all([
			uci.load('nordvpn'),
			getMeshPeerList()
		]);
    },

    render: function(data) {
		var meshPeers = data[1];

		if (uci.get('nordvpn', 'settings', 'meshnet') !== '1') {
			return E('div', { class: 'cbi-section', id: 'status_bar' }, [
				E('p', { id: 'service_status' }, _('Meshnet not enabled ...')),
			]);
		}

		var thisDevTable = E('table', { 'class': 'table', 'id': 'this_device' }, [
			E('tr', { 'class': 'tr table-titles' }, [
				E('th', { 'class': 'th col-2 hide-xs' }, [ _('Hostname') ]),
				E('th', { 'class': 'th col-2' }, [ _('Nickname') ]),
				E('th', { 'class': 'th col-7' }, [ _('IP') ]),
				E('th', { 'class': 'th col-7' }, [ _('Public Key') ]),
				E('th', { 'class': 'th col-4' }, [ _('OS') ]),
				E('th', { 'class': 'th col-4' }, [ _('Distribution') ])
			]),
			E('tr', { 'class': 'tr placeholder' }, [
				E('td', { 'class': 'td' }, [
					E('em', {}, [ _('Collecting data...') ])
				])
			])
		]);

		var localPeersTable = E('table', { 'class': 'table', 'id': 'local_peers' }, [
			E('tr', { 'class': 'tr table-titles' }, [
				E('th', { 'class': 'th col-2 hide-xs' }, [ _('Hostname') ]),
				E('th', { 'class': 'th col-2' }, [ _('Nickname') ]),
				E('th', { 'class': 'th col-2' }, [ _('Status') ]),
				E('th', { 'class': 'th col-7' }, [ _('IP') ]),
				E('th', { 'class': 'th col-7' }, [ _('Public Key') ]),
				E('th', { 'class': 'th col-4' }, [ _('OS') ]),
				E('th', { 'class': 'th col-4' }, [ _('Distribution') ]),
				E('th', { 'class': 'th col-2' }, [ _('Allow Incoming Traffic') ]),
				E('th', { 'class': 'th col-2' }, [ _('Allow Routing') ]),
				E('th', { 'class': 'th col-2' }, [ _('Allow Local Network Access') ]),
				E('th', { 'class': 'th col-2' }, [ _('Allow Sending Files') ]),
				E('th', { 'class': 'th col-2' }, [ _('Allows Incoming Traffic') ]),
				E('th', { 'class': 'th col-2' }, [ _('Allows Routing') ]),
				E('th', { 'class': 'th col-2' }, [ _('Allows Local Network Access') ]),
				E('th', { 'class': 'th col-2' }, [ _('Allows Sending Files') ]),
				E('th', { 'class': 'th col-2' }, [ _('Accept Fileshare Automatically') ])
			]),
			E('tr', { 'class': 'tr placeholder' }, [
				E('td', { 'class': 'td' }, [
					E('em', {}, [ _('Collecting data...') ])
				])
			])
		]);

		var externalPeersTable = E('table', { 'class': 'table', 'id': 'local_peers' }, [
			E('tr', { 'class': 'tr table-titles' }, [
				E('th', { 'class': 'th col-2 hide-xs' }, [ _('Hostname') ]),
				E('th', { 'class': 'th col-2' }, [ _('Nickname') ]),
				E('th', { 'class': 'th col-2' }, [ _('Status') ]),
				E('th', { 'class': 'th col-7' }, [ _('IP') ]),
				E('th', { 'class': 'th col-7' }, [ _('Public Key') ]),
				E('th', { 'class': 'th col-4' }, [ _('OS') ]),
				E('th', { 'class': 'th col-4' }, [ _('Distribution') ]),
				E('th', { 'class': 'th col-2' }, [ _('Allow Incoming Traffic') ]),
				E('th', { 'class': 'th col-2' }, [ _('Allow Routing') ]),
				E('th', { 'class': 'th col-2' }, [ _('Allow Local Network Access') ]),
				E('th', { 'class': 'th col-2' }, [ _('Allow Sending Files') ]),
				E('th', { 'class': 'th col-2' }, [ _('Allows Incoming Traffic') ]),
				E('th', { 'class': 'th col-2' }, [ _('Allows Routing') ]),
				E('th', { 'class': 'th col-2' }, [ _('Allows Local Network Access') ]),
				E('th', { 'class': 'th col-2' }, [ _('Allows Sending Files') ]),
				E('th', { 'class': 'th col-2' }, [ _('Accept Fileshare Automatically') ])
			]),
			E('tr', { 'class': 'tr placeholder' }, [
				E('td', { 'class': 'td' }, [
					E('em', {}, [ _('Collecting data...') ])
				])
			])
		]);

		if (typeof meshPeers.thisDevice !== 'undefined') {
			let thisDevice = convertDevToArray([meshPeers.thisDevice]);
			cbi_update_table(thisDevTable, thisDevice, E('em', _('No information available')));
		}
		if (meshPeers.localPeers.length > 0) {
			let localPeers = convertPeersToArrays(meshPeers.localPeers);
			cbi_update_table(localPeersTable, localPeers, E('em', _('No information available')));
		}
		if (meshPeers.externalPeers.length > 0) {
			let externalPeers = convertPeersToArrays(meshPeers.externalPeers);
			cbi_update_table(externalPeersTable, externalPeers, E('em', _('No information available')));
		}

		var v = E('div', { 'class': 'cbi-map', 'id': 'map' }, [
			E('h2', _('Meshnet peers')),
			E('div', {'class': 'cbi-map-descr'}, _('This page displays the current meshent peers.')),
			E('div', { 'class': 'cbi-section' }, [
				E('br'),
		
				E('div', { 'class': 'cbi-section-node' }, [
					E('h3', {}, [ _('This device') ]),
					thisDevTable
				]),
				E('br'),
				E('div', { 'class': 'cbi-section-node' }, [
					E('h3', {}, [ _('Local peers') ]),
					localPeersTable
				]),
				E('br'),
				E('div', { 'class': 'cbi-section-node' }, [
					E('h3', {}, [ _('External peers') ]),
					externalPeersTable
				]),
			])
		]);

		return v;
    },

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
