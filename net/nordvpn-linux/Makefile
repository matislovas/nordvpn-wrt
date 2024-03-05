# Metadata
include $(TOPDIR)/rules.mk

PKG_NAME:=nordvpn-linux
PKG_VERSION:=3.17.2
PKG_RELEASE:=1

PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION).tar.gz
PKG_SOURCE_URL:=https://github.com/NordSecurity/nordvpn-linux/archive/refs/tags/$(PKG_VERSION).tar.gz
PKG_HASH:=skip

PKG_MAINTAINER:=Matas Misiunas <matas.misiunas@nordsec.com>
PKG_LICENSE:=GPL-3.0-or-later
PKG_LICENSE_FILES:=LICENSE

# PKG_BUILD_PARALLEL:=1

PKG_BUILD_DEPENDS:=rust/host golang/host mage/host

include $(INCLUDE_DIR)/package.mk
include ../../../packages/lang/golang/golang-package.mk


define Package/nordvpn-linux
  SECTION:=net
  CATEGORY:=Network
  SUBMENU:=VPN
  TITLE:=NordVPN
  DEPENDS:=+libpthread +libstdcpp +libncurses +libopenssl +kmod-tun +kmod-inet-diag +ip +iptables +iptables-mod-conntrack-extra
endef

define Package/nordvpn-linux/description
  The official NordVPN Linux client.
endef

define Package/nordvpn-linux/prepare
endef

define Package/nordvpn-linux/compile
	mage build:binaries
endef

define Package/nordvpn-linux/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/build/nordvpn $(1)/usr/bin/
endef

$(eval $(call GoBinPackage,nordvpn-linux))
$(eval $(call BuildPackage,nordvpn-linux))
