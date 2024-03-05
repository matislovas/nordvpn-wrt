include $(TOPDIR)/rules.mk

PKG_NAME:=nordvpn-linux
PKG_VERSION:=3.18.2_openwrt
PKG_RELEASE:=1

PKG_SOURCE:=$(PKG_VERSION).zip
PKG_SOURCE_URL:=https://github.com/matislovas/$(PKG_NAME)/archive/
PKG_HASH:=skip

PKG_GIT_URL:=github.com/matislovas/nordvpn-linux
PKG_GIT_REF:=$(PKG_VERSION)

PKG_MAINTAINER:=Matas Misiunas <matislovas@gmail.com>
PKG_LICENSE:=GPL-3.0-or-later
PKG_LICENSE_FILES:=LICENSE

PKG_BUILD_PARALLEL:=1
PKG_BUILD_DEPENDS:=rust/host mage/host

include $(INCLUDE_DIR)/package.mk
include ../../../packages/lang/golang/golang-package.mk
include ../../../packages/lang/rust/rust-package.mk

define Package/nordvpn-linux
  SECTION:=net
  CATEGORY:=Network
  SUBMENU:=VPN
  TITLE:=NordVPN
  DEPENDS:=\
  	$(GO_ARCH_DEPENDS) \
	$(RUST_ARCH_DEPENDS) \
	+libpthread \
	+libstdcpp \
	+libncurses \
	+libopenssl \
	+kmod-tun \
	+kmod-inet-diag \
	+kmod-wireguard \
	+ip \
	+iptables \
	+iptables-mod-conntrack-extra \
	+libxml2
endef

define Package/nordvpn-linux/description
	The best online VPN service for speed and security. 
	NordVPN protects your privacy online and 
	lets access media content without regional restrictions. 
	Strong encryption and no-log policy 
	with 5000+ servers in 60+ countries.
endef

define Build/Prepare
	$(call Build/Prepare/Default)
	cp $(PKG_BUILD_DIR)/.env.sample $(PKG_BUILD_DIR)/.env
endef

define Build/Compile
	$(CURDIR)/../$(PKG_NAME)/git.sh \
		'https://$(PKG_GIT_URL)' \
		'$(PKG_BUILD_DIR)' \
		'$(PKG_GIT_REF)'; \
	mage -d $(PKG_BUILD_DIR) build:openwrt "\
		$(GO_GENERAL_BUILD_CONFIG_VARS) \
		$(GO_PKG_BUILD_CONFIG_VARS) \
		$(GO_PKG_VARS) \
		$(GO_PKG_INSTALL_ARGS)" "\
		$(CARGO_PKG_VARS)"; \
	mage -d $(PKG_BUILD_DIR) build:openwrtOpenvpn; \
	rm -rf $(PKG_BUILD_DIR)/.git; \
	$(STRIP) $(PKG_BUILD_DIR)/bin/$(GO_ARCH)/nordvpnd; \
	$(STRIP) $(PKG_BUILD_DIR)/bin/$(GO_ARCH)/nordvpn; \
	$(STRIP) $(PKG_BUILD_DIR)/bin/deps/openvpn/${GO_ARCH}/latest/openvpn
endef

define Package/nordvpn-linux/install
	mkdir -p $(1)/usr/lib/nordvpn
	$(INSTALL_DIR) $(1)/usr/sbin $(1)/usr/bin $(1)/usr/lib/nordvpn $(1)/etc/init.d $(1)/etc/config
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/bin/$(GO_ARCH)/nordvpnd $(1)/usr/sbin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/bin/$(GO_ARCH)/nordvpn $(1)/usr/bin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/bin/deps/openvpn/${GO_ARCH}/latest/openvpn $(1)/usr/lib/nordvpn
	$(INSTALL_BIN) ./files//nordvpn.init $(1)/etc/init.d/nordvpn
	$(INSTALL_DATA) ./files//nordvpn.conf $(1)/etc/config/nordvpn
endef

$(eval $(call GoBinPackage,nordvpn-linux))
$(eval $(call BuildPackage,nordvpn-linux))
