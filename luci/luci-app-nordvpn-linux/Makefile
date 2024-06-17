#
# Copyright (C) 2024 NordSecurity
#
# This is free software, licensed under the GPL-3.0 License.

include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI for nordvpn-linux
LUCI_DEPENDS:=+luci-base +nordvpn-linux
LUCI_PKGARCH:=all

PKG_VERSION:=1.0.0
PKG_MAINTAINER:=Matas Misiunas <matislovas@gmail.com>
PKG_LICENSE:=GPL-3.0

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
